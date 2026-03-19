const express = require('express');
const amqp = require('amqplib');
const logger = require('shared/logger');
const errorHandler = require('shared/errorHandler');
const authorize = require('shared/auth');

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672';

// In-memory store for SSE clients keyed by userId
const clients = new Map();

// SSE endpoint: browser connects here to receive live push events
app.get('/api/notifications/stream', (req, res) => {
    // EventSource doesn't support headers, so we check query param too
    const token = req.query.token || req.headers['authorization']?.split(' ')[1];
    
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.id;

        res.set({
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
        });
        res.flushHeaders();

        // Send initial "connected" ping
        res.write(`event: connected\ndata: ${JSON.stringify({ message: 'Notification stream live' })}\n\n`);

        // Register this SSE client
        if (!clients.has(userId)) clients.set(userId, []);
        clients.get(userId).push(res);

        logger.info(`SSE client connected: user ${userId} (${clients.get(userId).length} active)`);

        // Cleanup on disconnect
        req.on('close', () => {
            const userClients = clients.get(userId) || [];
            const updated = userClients.filter(c => c !== res);
            if (updated.length === 0) clients.delete(userId);
            else clients.set(userId, updated);
            logger.info(`SSE client disconnected: user ${userId}`);
        });
    } catch (err) {
        logger.error('SSE connection failed:', err);
        return res.status(401).json({ error: 'Invalid token' });
    }
});

// Broadcast helper
function broadcastToAll(event, data) {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    clients.forEach((conns) => conns.forEach(c => c.write(payload)));
}

// Targeted send helper
function sendToUser(userId, event, data) {
    const conns = clients.get(userId);
    if (conns) {
        const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        conns.forEach(c => c.write(payload));
    }
}

async function connectAndConsume() {
    try {
        const conn = await amqp.connect(RABBITMQ_URL);
        const channel = await conn.createChannel();
        await channel.assertExchange('decp_events', 'topic', { durable: true });

        const q = await channel.assertQueue('notification_queue', { durable: true });
        await channel.bindQueue(q.queue, 'decp_events', 'feed.#');
        await channel.bindQueue(q.queue, 'decp_events', 'event.#');
        await channel.bindQueue(q.queue, 'decp_events', 'job.#');
        await channel.bindQueue(q.queue, 'decp_events', 'new_message');
        await channel.bindQueue(q.queue, 'decp_events', 'new_group_message');

        logger.info('Notification Service connected to RabbitMQ. Waiting for messages...');

        channel.consume(q.queue, (msg) => {
            if (!msg) return;
            const payload = JSON.parse(msg.content.toString());
            const routingKey = msg.fields.routingKey;

            logger.info(`Consumed [${routingKey}]:`, payload.event);

            // Map event types to browser notification payloads
            if (routingKey === 'feed.new') {
                broadcastToAll('new_post', {
                    title: 'New Post',
                    body: `@${payload.username} shared a new post.`,
                    timestamp: new Date().toISOString(),
                });
            } else if (routingKey === 'event.rsvp') {
                broadcastToAll('event_rsvp', {
                    title: 'Event RSVP',
                    body: `@${payload.username} RSVPed to an event.`,
                    timestamp: new Date().toISOString(),
                });
            } else if (routingKey === 'event.new') {
                broadcastToAll('new_event', {
                    title: '📅 New Event',
                    body: `A new event "${payload.title}" has been scheduled!`,
                    timestamp: new Date().toISOString(),
                });
            } else if (routingKey === 'job.new') {
                broadcastToAll('new_job', {
                    title: '💼 New Job Posted',
                    body: `A new job opportunity has been posted!`,
                    timestamp: new Date().toISOString(),
                });
            } else if (routingKey === 'new_message' || routingKey === 'new_group_message') {
                if (payload.receiver_id) {
                    sendToUser(payload.receiver_id, routingKey, {
                        title: payload.title,
                        body: payload.body,
                        sender_username: payload.sender_username,
                        timestamp: new Date().toISOString(),
                    });
                }
            }

            channel.ack(msg);
        });
    } catch (err) {
        logger.error('RabbitMQ consumer failed', err);
        // Retry after 5 seconds
        setTimeout(connectAndConsume, 5000);
    }
}

connectAndConsume();

app.get('/api/notifications/health', (req, res) => res.json({
    status: 'Notification Service OK',
    connectedClients: [...clients.values()].reduce((a, b) => a + b.length, 0)
}));

app.use(errorHandler);

app.listen(PORT, () => logger.info(`Notification Service listening on port ${PORT}`));
