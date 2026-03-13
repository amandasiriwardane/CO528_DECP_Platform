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
        logger.info('Event Service connected to RabbitMQ');
    } catch (err) {
        logger.error('RabbitMQ connection failed', err);
    }
}

connectRabbitMQ();

app.get('/api/events', authorize(), async (req, res, next) => {
    try {
        const result = await db.query(`
      SELECT e.id, e.title, e.date, e.created_at, u.username, u.role
      FROM events e
      LEFT JOIN users u ON e.created_by = u.id
      ORDER BY e.date ASC
    `);
        res.json({ events: result.rows });
    } catch (error) {
        next(error);
    }
});

app.post('/api/events/create', authorize(['Admin']), async (req, res, next) => {
    try {
        const { title, date } = req.body;
        const userId = req.user.id;

        if (!title || !date) return res.status(400).json({ error: 'Title and date required' });

        const result = await db.query(
            'INSERT INTO events (title, date, created_by) VALUES ($1, $2, $3) RETURNING *',
            [title, date, userId]
        );

        const newEvent = result.rows[0];

        const message = { event: 'New Event', title: newEvent.title, date: newEvent.date, timestamp: new Date() };
        if (channel) {
            channel.publish('decp_events', 'event.new', Buffer.from(JSON.stringify(message)));
            logger.info('Published New Event trigger to RabbitMQ');
        }

        res.status(201).json({ success: true, event: newEvent });
    } catch (error) {
        next(error);
    }
});

app.use(errorHandler);

app.listen(PORT, () => logger.info(`Event Service listening on port ${PORT}`));
