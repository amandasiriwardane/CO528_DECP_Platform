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
      SELECT e.id, e.title, e.date, e.venue, e.description, e.created_at, u.username, u.role, u.first_name, u.last_name,
      EXISTS(SELECT 1 FROM event_rsvps WHERE event_id = e.id AND user_id = $1) as has_rsvp,
      (SELECT COUNT(*) FROM event_rsvps WHERE event_id = e.id) as rsvp_count
      FROM events e
      LEFT JOIN users u ON e.created_by = u.id
      ORDER BY e.date ASC
    `, [req.user.id]);
        res.json({ events: result.rows });
    } catch (error) {
        next(error);
    }
});

app.post('/api/events/:id/rsvp', authorize(), async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const event = await db.query('SELECT * FROM events WHERE id = $1', [id]);
        if (event.rows.length === 0) return res.status(404).json({ error: 'Event not found' });

        const exists = await db.query('SELECT 1 FROM event_rsvps WHERE event_id = $1 AND user_id = $2', [id, userId]);
        
        if (exists.rows.length > 0) {
            // Cancel RSVP
            await db.query('DELETE FROM event_rsvps WHERE event_id = $1 AND user_id = $2', [id, userId]);
            res.json({ success: true, rsvped: false });
        } else {
            // RSVP
            await db.query('INSERT INTO event_rsvps (event_id, user_id) VALUES ($1, $2)', [id, userId]);
            
            if (channel) {
                const message = { event: 'User RSVP', userId, username: req.user.username, eventId: id, timestamp: new Date() };
                channel.publish('decp_events', 'event.rsvp', Buffer.from(JSON.stringify(message)));
                logger.info(`Published User RSVP to RabbitMQ for event ${id}`);
            }

            res.json({ success: true, rsvped: true });
        }
    } catch (error) {
        next(error);
    }
});

app.post('/api/events/create', authorize(['Admin', 'Alumni']), async (req, res, next) => {
    try {
        const { title, date, venue, description } = req.body;
        const userId = req.user.id;

        if (!title || !date) return res.status(400).json({ error: 'Title and date required' });

        const result = await db.query(
            'INSERT INTO events (title, date, venue, description, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [title, date, venue, description, userId]
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
