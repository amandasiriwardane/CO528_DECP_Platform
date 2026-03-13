const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const logger = require('shared/logger');
const errorHandler = require('shared/errorHandler');

const app = express();
const PORT = process.env.PORT || 8080;

app.use((req, res, next) => {
    logger.info('Gateway Request:', { method: req.method, path: req.url });
    next();
});

// Route mapping to Internal Docker DNS
const services = {
    '/api/users': 'http://user-service:3000',
    '/api/feed': 'http://feed-service:3000',
    '/api/jobs': 'http://job-service:3000',
    '/api/events': 'http://event-service:3000',
    '/api/notifications': 'http://notification-service:3000'
};

for (const [route, target] of Object.entries(services)) {
    app.use(route, createProxyMiddleware({ target, changeOrigin: true }));
}

app.get('/health', (req, res) => res.json({ status: 'Gateway OK' }));

app.use(errorHandler);

app.listen(PORT, () => {
    logger.info(`API Gateway listening on port ${PORT}`);
});
