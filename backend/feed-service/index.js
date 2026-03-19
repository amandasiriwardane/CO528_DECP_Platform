const express = require('express');
const amqp = require('amqplib');
const { S3Client, HeadBucketCommand, CreateBucketCommand, PutBucketPolicyCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
const logger = require('shared/logger');
const errorHandler = require('shared/errorHandler');
const db = require('shared/db');
const authorize = require('shared/auth');
const crypto = require('crypto');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672';
const S3_ENDPOINT = process.env.S3_ENDPOINT || 'minio';
const S3_PORT = process.env.S3_PORT || 9000;
const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY || 'admin';
const S3_SECRET_KEY = process.env.S3_SECRET_KEY || 'password123';
const BUCKET_NAME = 'feed-media';

const s3 = new S3Client({
    endpoint: `http://${S3_ENDPOINT}:${S3_PORT}`,
    region: 'us-east-1',
    credentials: { accessKeyId: S3_ACCESS_KEY, secretAccessKey: S3_SECRET_KEY },
    forcePathStyle: true
});

async function initS3() {
    try {
        await s3.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
        logger.info(`MinIO bucket '${BUCKET_NAME}' already exists.`);
    } catch (e) {
        if (e.name === 'NotFound') {
            await s3.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }));
            logger.info(`MinIO bucket '${BUCKET_NAME}' created.`);
            // Set bucket policy for public READ access
            const policy = {
                Version: "2012-10-17",
                Statement: [{ Action: ["s3:GetObject"], Effect: "Allow", Principal: "*", Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`] }]
            };
            await s3.send(new PutBucketPolicyCommand({ Bucket: BUCKET_NAME, Policy: JSON.stringify(policy) }));
        } else {
            logger.error('S3 Initialization Error:', e);
        }
    }
}
initS3();

const upload = multer({
    storage: multerS3({
        s3,
        bucket: BUCKET_NAME,
        key: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`)
    })
});

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

// Auto DB init (via shared) is handled by user-service or implicitly here.
// Fetch feed
app.get('/api/feed', authorize(), async (req, res, next) => {
    try {
        const result = await db.query(`
            SELECT 
                p.id, p.content, p.image_url, p.created_at, 
                u.username, u.first_name, u.last_name, u.role,
                (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
                EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = $1) as is_liked,
                (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count
            FROM posts p
            JOIN users u ON p.user_id = u.id
            ORDER BY p.created_at DESC
            LIMIT 50
        `, [req.user.id]);
        
        // Transform the MinIO URL to point to localhost if accessed externally
        const posts = result.rows.map(post => {
            if (post.image_url) {
                post.image_url = post.image_url.replace('http://minio:9000', 'http://localhost:9000');
            }
            return post;
        });

        res.json({ posts });
    } catch (error) {
        next(error);
    }
});

// Create post with optional Media
app.post('/api/feed/post', authorize(), upload.single('media'), async (req, res, next) => {
    try {
        const { content } = req.body;
        const userId = req.user.id;
        const imageUrl = req.file ? req.file.location : null;

        if (!content && !imageUrl) return res.status(400).json({ error: 'Post content or media is required' });

        const result = await db.query(
            'INSERT INTO posts (user_id, content, image_url) VALUES ($1, $2, $3) RETURNING *',
            [userId, content || '', imageUrl]
        );

        const newPost = result.rows[0];

        if (channel) {
            const message = { event: 'New Post', userId, username: req.user.username, postId: newPost.id };
            channel.publish('decp_events', 'feed.new', Buffer.from(JSON.stringify(message)));
        }

        res.status(201).json({ success: true, post: newPost });
    } catch (error) {
        next(error);
    }
});

// Like a post
app.post('/api/feed/post/:id/like', authorize(), async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const exists = await db.query('SELECT 1 FROM likes WHERE user_id = $1 AND post_id = $2', [userId, id]);
        
        if (exists.rows.length > 0) {
            await db.query('DELETE FROM likes WHERE user_id = $1 AND post_id = $2', [userId, id]);
            res.json({ success: true, liked: false });
        } else {
            await db.query('INSERT INTO likes (user_id, post_id) VALUES ($1, $2)', [userId, id]);
            res.json({ success: true, liked: true });
        }
    } catch (error) {
        next(error);
    }
});

// Comment on a post
app.post('/api/feed/post/:id/comment', authorize(), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        if (!content) return res.status(400).json({ error: 'Comment cannot be empty' });

        const result = await db.query(
            'INSERT INTO comments (post_id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
            [id, userId, content]
        );

        res.status(201).json({ success: true, comment: result.rows[0] });
    } catch (error) {
        next(error);
    }
});

// Get comments for a post
app.get('/api/feed/post/:id/comments', authorize(), async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await db.query(`
            SELECT c.id, c.content, c.created_at, u.username, u.first_name, u.last_name
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.post_id = $1
            ORDER BY c.created_at ASC
        `, [id]);
        res.json({ comments: result.rows });
    } catch (error) {
        next(error);
    }
});

app.use(errorHandler);
app.listen(PORT, () => logger.info(`Feed Service listening on port ${PORT}`));
