const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const logger = require('shared/logger');
const errorHandler = require('shared/errorHandler');

const app = express();

// Standardize CORS options
const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
// Hardcode Preflight OPTIONS response to guarantee it NEVER hits the proxy
app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        res.header('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');
        return res.status(204).end();
    }
    next();
});

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
    app.use(route, createProxyMiddleware({
        target,
        changeOrigin: true,
        onProxyRes: function (proxyRes, req, res) {
            proxyRes.headers['Access-Control-Allow-Origin'] = '*';
            proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS, PUT, PATCH, DELETE';
            proxyRes.headers['Access-Control-Allow-Headers'] = 'X-Requested-With,content-type,Authorization';
        }
    }));
}

app.get('/health', (req, res) => res.json({ status: 'Gateway OK' }));

app.use(errorHandler);

app.listen(PORT, () => {
    logger.info(`API Gateway listening on port ${PORT}`);
});
