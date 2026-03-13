const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const logger = require('shared/logger');
const errorHandler = require('shared/errorHandler');
const db = require('shared/db');
const authorize = require('shared/auth');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Initialize the database connection and tables
db.initDB();

app.post('/api/users/register', async (req, res, next) => {
    try {
        const { username, password, role } = req.body;
        if (!username || !password || !role) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await db.query(
            'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, role',
            [username, hashedPassword, role]
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
        const result = await db.query('SELECT id, username, role, created_at FROM users WHERE id = $1', [req.user.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });

        res.json({ profile: result.rows[0] });
    } catch (error) {
        next(error);
    }
});

// Admin only route example
app.get('/api/users/admin-data', authorize('Admin'), (req, res) => {
    res.json({ data: 'Sensitive Student Performance Analytics perfectly siloed.' });
});

app.use(errorHandler);

app.listen(PORT, () => logger.info(`User Service listening on port ${PORT}`));
