const express = require('express');
const logger = require('shared/logger');
const errorHandler = require('shared/errorHandler');
const db = require('shared/db');
const authorize = require('shared/auth');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/api/jobs', authorize(), async (req, res, next) => {
    try {
        const result = await db.query(`
      SELECT j.id, j.title, j.description, j.created_at, u.username, u.role
      FROM jobs j
      LEFT JOIN users u ON j.posted_by = u.id
      ORDER BY j.created_at DESC
    `);
        res.json({ jobs: result.rows });
    } catch (error) {
        next(error);
    }
});

app.post('/api/jobs/post', authorize(['Admin', 'Alumni']), async (req, res, next) => {
    try {
        const { title, description } = req.body;
        const userId = req.user.id;

        if (!title || !description) return res.status(400).json({ error: 'Title and description required' });

        const result = await db.query(
            'INSERT INTO jobs (title, description, posted_by) VALUES ($1, $2, $3) RETURNING *',
            [title, description, userId]
        );

        logger.info(`New Job created: ${title} by ${req.user.username}`);
        res.status(201).json({ success: true, job: result.rows[0] });
    } catch (error) {
        next(error);
    }
});

app.use(errorHandler);

app.listen(PORT, () => logger.info(`Job Service listening on port ${PORT}`));
