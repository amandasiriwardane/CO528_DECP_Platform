const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const amqp = require('amqplib');
const logger = require('shared/logger');
const errorHandler = require('shared/errorHandler');
const db = require('shared/db');
const authorize = require('shared/auth');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672';

let channel;
async function connectRabbitMQ() {
    try {
        const conn = await amqp.connect(RABBITMQ_URL);
        channel = await conn.createChannel();
        await channel.assertExchange('decp_events', 'topic', { durable: true });
        logger.info('User Service connected to RabbitMQ');
    } catch (err) {
        logger.error('RabbitMQ connection failed', err);
    }
}
connectRabbitMQ();

// Initialize the database connection and tables
db.initDB();

app.post('/api/users/register', async (req, res, next) => {
    try {
        const { username, password, role, first_name, last_name } = req.body;
        if (!username || !password || !role) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await db.query(
            'INSERT INTO users (username, password, role, first_name, last_name) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, first_name, last_name, role',
            [username, hashedPassword, role, first_name, last_name]
        );

        logger.info(`New user registered: ${username} as ${role}`);
        res.status(201).json({ success: true, user: result.rows[0] });
    } catch (error) {
        if (error.code === '23505') { // Postgres unique violation
            return res.status(409).json({ error: 'Username already exists' });
        }
        next(error);
    }
});

app.post('/api/users/login', async (req, res, next) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ error: 'Missing credentials' });

        const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
        if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

        const user = result.rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
        logger.info(`User logged in: ${username}`);

        res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
    } catch (error) {
        next(error);
    }
});

app.get('/api/users/profile', authorize(), async (req, res, next) => {
    try {
        const result = await db.query('SELECT id, username, first_name, last_name, role, created_at FROM users WHERE id = $1', [req.user.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });

        res.json({ profile: result.rows[0] });
    } catch (error) {
        next(error);
    }
});

// List all users (for DM recipient selection)
app.get('/api/users/list', authorize(), async (req, res, next) => {
    try {
        const result = await db.query(
            'SELECT id, username, first_name, last_name, role FROM users WHERE id != $1 ORDER BY first_name',
            [req.user.id]
        );
        res.json({ users: result.rows });
    } catch (error) {
        next(error);
    }
});

// Send a direct message
app.post('/api/users/messages', authorize(), async (req, res, next) => {
    try {
        const { receiver_id, content } = req.body;
        if (!receiver_id || !content) return res.status(400).json({ error: 'receiver_id and content required' });

        const result = await db.query(
            'INSERT INTO direct_messages (sender_id, receiver_id, content) VALUES ($1, $2, $3) RETURNING *',
            [req.user.id, receiver_id, content]
        );
        const message = result.rows[0];

        // Notify via RabbitMQ
        if (channel) {
            channel.publish('decp_events', 'new_message', Buffer.from(JSON.stringify({
                title: 'New Message',
                body: `You received a message from ${req.user.username}`,
                receiver_id: parseInt(receiver_id),
                sender_id: req.user.id,
                sender_username: req.user.username
            })));
        }

        res.status(201).json({ success: true, message });
    } catch (error) {
        next(error);
    }
});

// Get conversation between logged-in user and another user
app.get('/api/users/messages/:userId', authorize(), async (req, res, next) => {
    try {
        const { userId } = req.params;
        const myId = req.user.id;
        const result = await db.query(`
            SELECT dm.*, 
                   s.username as sender_username, s.first_name as sender_first_name,
                   r.username as receiver_username, r.first_name as receiver_first_name
            FROM direct_messages dm
            JOIN users s ON dm.sender_id = s.id
            JOIN users r ON dm.receiver_id = r.id
            WHERE (dm.sender_id = $1 AND dm.receiver_id = $2)
               OR (dm.sender_id = $2 AND dm.receiver_id = $1)
            ORDER BY dm.created_at ASC
        `, [myId, userId]);

        // Mark received messages as read
        await db.query(
            'UPDATE direct_messages SET read = TRUE WHERE sender_id = $1 AND receiver_id = $2 AND read = FALSE',
            [userId, myId]
        );

        res.json({ messages: result.rows });
    } catch (error) {
        next(error);
    }
});

// Get unread message count
// Update profile info
app.put('/api/users/profile', authorize(), async (req, res, next) => {
    try {
        const { first_name, last_name } = req.body;
        await db.query(
            'UPDATE users SET first_name = $1, last_name = $2 WHERE id = $3',
            [first_name, last_name, req.user.id]
        );
        res.json({ success: true });
    } catch (error) { next(error); }
});

// Update password
app.put('/api/users/password', authorize(), async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const result = await db.query('SELECT password FROM users WHERE id = $1', [req.user.id]);
        const user = result.rows[0];

        const match = await bcrypt.compare(currentPassword, user.password);
        if (!match) return res.status(401).json({ error: 'Current password incorrect' });

        const hashed = await bcrypt.hash(newPassword, 10);
        await db.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, req.user.id]);
        res.json({ success: true });
    } catch (error) { next(error); }
});

// Admin Stats
app.get('/api/users/admin/stats', authorize(['Admin']), async (req, res, next) => {
    try {
        const userResult = await db.query('SELECT COUNT(*) as count FROM users');
        const postResult = await db.query('SELECT COUNT(*) as count FROM posts');
        const jobResult = await db.query('SELECT COUNT(*) as count FROM jobs');
        const eventResult = await db.query('SELECT COUNT(*) as count FROM events');

        res.json({
            totalUsers: parseInt(userResult.rows[0].count),
            totalPosts: parseInt(postResult.rows[0].count),
            totalJobs: parseInt(jobResult.rows[0].count),
            totalEvents: parseInt(eventResult.rows[0].count)
        });
    } catch (error) { next(error); }
});

// Research Projects
app.get('/api/users/projects', authorize(), async (req, res, next) => {
    try {
        const result = await db.query(`
            SELECT p.*, u.username as creator_username,
            (SELECT COUNT(*) FROM project_members WHERE project_id = p.id) as member_count,
            (SELECT COUNT(*) FROM project_documents WHERE project_id = p.id) as doc_count
            FROM projects p
            JOIN users u ON p.creator_id = u.id
            ORDER BY p.created_at DESC
        `);
        res.json({ projects: result.rows });
    } catch (error) { next(error); }
});

// Research Projects (continued)
app.post('/api/users/projects', authorize(), async (req, res, next) => {
    try {
        const { title, description } = req.body;
        const result = await db.query(
            'INSERT INTO projects (title, description, creator_id) VALUES ($1, $2, $3) RETURNING *',
            [title, description, req.user.id]
        );
        const project = result.rows[0];
        await db.query('INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3)', [project.id, req.user.id, 'Creator']);
        res.status(201).json({ success: true, project });
    } catch (error) { next(error); }
});

// Unread message count (restored)
app.get('/api/users/messages/unread/count', authorize(), async (req, res, next) => {
    try {
        const result = await db.query(
            'SELECT COUNT(*) as count FROM direct_messages WHERE receiver_id = $1 AND read = FALSE',
            [req.user.id]
        );
        res.json({ count: parseInt(result.rows[0].count) });
    } catch (error) { next(error); }
});

// Group Messaging
app.get('/api/users/groups', authorize(), async (req, res, next) => {
    try {
        const result = await db.query(`
            SELECT g.* FROM groups g
            JOIN group_members gm ON g.id = gm.group_id
            WHERE gm.user_id = $1
        `, [req.user.id]);
        res.json({ groups: result.rows });
    } catch (error) { next(error); }
});

app.post('/api/users/groups', authorize(), async (req, res, next) => {
    try {
        const { name, description, memberIds } = req.body;
        const result = await db.query(
            'INSERT INTO groups (name, description, created_by) VALUES ($1, $2, $3) RETURNING *',
            [name, description, req.user.id]
        );
        const group = result.rows[0];
        // Add creator and selected members
        const allMembers = [...new Set([req.user.id, ...(memberIds || [])])];
        for (const mId of allMembers) {
            await db.query('INSERT INTO group_members (group_id, user_id) VALUES ($1, $2)', [group.id, mId]);
        }
        res.status(201).json({ success: true, group });
    } catch (error) { next(error); }
});

app.get('/api/users/groups/:groupId/messages', authorize(), async (req, res, next) => {
    try {
        const { groupId } = req.params;
        const result = await db.query(`
            SELECT gm.*, u.username as sender_username, u.first_name as sender_first_name
            FROM group_messages gm
            JOIN users u ON gm.sender_id = u.id
            WHERE gm.group_id = $1
            ORDER BY gm.created_at ASC
        `, [groupId]);
        res.json({ messages: result.rows });
    } catch (error) { next(error); }
});

app.post('/api/users/groups/:groupId/messages', authorize(), async (req, res, next) => {
    try {
        const { groupId } = req.params;
        const { content } = req.body;
        const result = await db.query(
            'INSERT INTO group_messages (group_id, sender_id, content) VALUES ($1, $2, $3) RETURNING *',
            [groupId, req.user.id, content]
        );
        const message = result.rows[0];

        // Get group info for notification
        const groupRes = await db.query('SELECT name FROM groups WHERE id = $1', [groupId]);
        const groupName = groupRes.rows[0]?.name || 'a group';

        // Get group members to notify
        const memberRes = await db.query('SELECT user_id FROM group_members WHERE group_id = $1 AND user_id != $2', [groupId, req.user.id]);
        
        // Notify via RabbitMQ for each member
        if (channel) {
            memberRes.rows.forEach(member => {
                channel.publish('decp_events', 'new_group_message', Buffer.from(JSON.stringify({
                    title: `New Message in ${groupName}`,
                    body: `${req.user.username}: ${content.substring(0, 30)}${content.length > 30 ? '...' : ''}`,
                    receiver_id: member.user_id,
                    group_id: groupId,
                    sender_username: req.user.username
                })));
            });
        }

        res.status(201).json({ success: true, message });
    } catch (error) { next(error); }
});

app.use(errorHandler);

app.listen(PORT, () => logger.info(`User Service listening on port ${PORT}`));

