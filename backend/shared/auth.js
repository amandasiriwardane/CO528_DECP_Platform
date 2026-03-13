const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const authorize = (roles = []) => {
    if (typeof roles === 'string') {
        roles = [roles];
    }
    return [
        (req, res, next) => {
            const authHeader = req.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1];
            if (!token) return res.status(401).json({ error: 'Unauthorized' });

            jwt.verify(token, JWT_SECRET, (err, user) => {
                if (err) return res.status(403).json({ error: 'Forbidden. Invalid or expired token.' });
                req.user = user;
                if (roles.length && !roles.includes(user.role)) {
                    return res.status(403).json({ error: 'Insufficient permissions' });
                }
                next();
            });
        }
    ];
};

module.exports = authorize;
