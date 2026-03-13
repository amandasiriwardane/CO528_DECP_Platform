const express = require('express');
const amqp = require('amqplib');
const logger = require('shared/logger');
const errorHandler = require('shared/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

async function connectAndConsume() {
    try {
        const conn = await amqp.connect(RABBITMQ_URL);
        const channel = await conn.createChannel();
        await channel.assertExchange('decp_events', 'topic', { durable: true });

        // Listen to feed and event triggers
        const q = await channel.assertQueue('notification_queue', { durable: true });
        await channel.bindQueue(q.queue, 'decp_events', 'feed.#');
        await channel.bindQueue(q.queue, 'decp_events', 'event.#');

        logger.info('Notification Service connected to RabbitMQ. Waiting for messages...');

        channel.consume(q.queue, (msg) => {
            if (msg) {
                const payload = JSON.parse(msg.content.toString());
                logger.info('Consumed Event Triggered Notification:', { routingKey: msg.fields.routingKey, event: payload.event });

                // Simulating external SMTP/Push Notification mapping
                if (payload.event === 'New Event') {
                    logger.info(`Sending RSVP push notifications for: ${payload.title}`);
                } else if (payload.event === 'New Post') {
                    logger.info(`Sending feed update notifications.`);
                }

                channel.ack(msg);
            }
        });
    } catch (err) {
        logger.error('RabbitMQ consumer failed', err);
    }
}

connectAndConsume();

app.get('/api/notifications/health', (req, res) => res.json({ status: 'Notification Service OK' }));

app.use(errorHandler);

app.listen(PORT, () => logger.info(`Notification Service listening on port ${PORT}`));
