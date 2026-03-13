const express = require('express');
const amqp = require('amqplib');
const logger = require('shared/logger');
const errorHandler = require('shared/errorHandler');
const db = require('shared/db');
const authorize = require('shared/auth');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

let channel;

async function connectRabbitMQ() {
    try {
        const conn = await amqp.connect(RABBITMQ_URL);
        channel = await conn.createChannel();
        await channel.assertExchange('decp_events', 'topic', { durable: true });
        logger.info('Feed Service connected to RabbitMQ');
    } catch (err) {
        logger.error('RabbitMQ connection failed', err);
    }
}

connectRabbitMQ();

// Fetch feed
app.get('/api/feed', authorize(), async (req, res, next) => {
    try {
        const result = await db.query(`
      SELECT p.id, p.content, p.created_at, u.username, u.role
      FROM posts p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
      LIMIT 50
    `);
        res.json({ posts: result.rows });
    } catch (error) {
        next(error);
    }
});

// Create post
app.post('/api/feed/post', authorize(), async (req, res, next) => {
    try {
        const { content } = req.body;
        const userId = req.user.id;

        if (!content) return res.status(400).json({ error: 'Post content cannot be empty' });

        const result = await db.query(
            'INSERT INTO posts (user_id, content) VALUES ($1, $2) RETURNING *',
            [userId, content]
        );

        const newPost = result.rows[0];

        const message = { event: 'New Post', userId, username: req.user.username, postId: newPost.id, timestamp: new Post().created_at };
        if (channel) {
            channel.publish('decp_events', 'feed.new', Buffer.from(JSON.stringify(message)));
            logger.info(`Published New Post event to RabbitMQ by user ${req.user.username}`);
        }

        res.status(201).json({ success: true, post: newPost });
    } catch (error) {
        next(error);
    }
});

app.use(errorHandler);

app.listen(PORT, () => logger.info(`Feed Service listening on port ${PORT}`));
