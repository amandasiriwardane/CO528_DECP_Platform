const express = require('express');
const amqp = require('amqplib');
const logger = require('shared/logger');
const errorHandler = require('shared/errorHandler');
const db = require('shared/db');
const authorize = require('shared/auth');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672';

let channel;
async function connectRabbitMQ() {
    try {
        const conn = await amqp.connect(RABBITMQ_URL);
        channel = await conn.createChannel();
        await channel.assertExchange('decp_events', 'topic', { durable: true });
        logger.info('Job Service connected to RabbitMQ');
    } catch (err) {
        logger.error('RabbitMQ connection failed', err);
        setTimeout(connectRabbitMQ, 5000);
    }
}
connectRabbitMQ();

// Get all jobs (with apply status for current user)
app.get('/api/jobs', authorize(), async (req, res, next) => {
    try {
        const result = await db.query(`
      SELECT j.id, j.title, j.description, j.created_at, u.username, u.role, u.first_name, u.last_name,
      EXISTS(SELECT 1 FROM job_applications WHERE job_id = j.id AND user_id = $1) as has_applied
      FROM jobs j
      LEFT JOIN users u ON j.posted_by = u.id
      ORDER BY j.created_at DESC
    `, [req.user.id]);
        res.json({ jobs: result.rows });
    } catch (error) {
        next(error);
    }
});

// Post a new job (Admin or Alumni only)
app.post('/api/jobs/post', authorize(['Admin', 'Alumni']), async (req, res, next) => {
    try {
        const { title, description } = req.body;
        const userId = req.user.id;

        if (!title || !description) return res.status(400).json({ error: 'Title and description required' });

        const result = await db.query(
            'INSERT INTO jobs (title, description, posted_by) VALUES ($1, $2, $3) RETURNING *',
            [title, description, userId]
        );

        const newJob = result.rows[0];
        logger.info(`New Job created: ${title} by ${req.user.username}`);

        // Publish to RabbitMQ so notification-service can broadcast
        if (channel) {
            const message = { event: 'New Job', title, postedBy: req.user.username, jobId: newJob.id };
            channel.publish('decp_events', 'job.new', Buffer.from(JSON.stringify(message)));
        }

        res.status(201).json({ success: true, job: newJob });
    } catch (error) {
        next(error);
    }
});

const { S3Client, HeadBucketCommand, CreateBucketCommand, PutBucketPolicyCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');

const S3_ENDPOINT = process.env.S3_ENDPOINT || 'minio';
const S3_PORT = process.env.S3_PORT || 9000;
const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY || 'admin';
const S3_SECRET_KEY = process.env.S3_SECRET_KEY || 'password123';
const BUCKET_NAME = 'resumes';

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
        if (e.name === 'NotFound' || e.$metadata?.httpStatusCode === 404) {
            await s3.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }));
            logger.info(`MinIO bucket '${BUCKET_NAME}' created.`);
            const policy = {
                Version: "2012-10-17",
                Statement: [{ Action: ["s3:GetObject"], Effect: "Allow", Principal: "*", Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`] }]
            };
            await s3.send(new PutBucketPolicyCommand({ Bucket: BUCKET_NAME, Policy: JSON.stringify(policy) }));
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

// Apply to a job with CV upload
app.post('/api/jobs/:id/apply', authorize(), upload.single('resume'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const resumeUrl = req.file ? `http://localhost:${S3_PORT}/${BUCKET_NAME}/${req.file.key}` : null;

        const job = await db.query('SELECT * FROM jobs WHERE id = $1', [id]);
        if (job.rows.length === 0) return res.status(404).json({ error: 'Job not found' });
        if (job.rows[0].posted_by === userId) return res.status(400).json({ error: 'Cannot apply to your own job' });

        const result = await db.query(
            'INSERT INTO job_applications (job_id, user_id, resume_url) VALUES ($1, $2, $3) RETURNING *',
            [id, userId, resumeUrl]
        );
        res.status(201).json({ success: true, application: result.rows[0] });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ error: 'You have already applied to this job' });
        }
        next(error);
    }
});

app.use(errorHandler);
app.listen(PORT, () => logger.info(`Job Service listening on port ${PORT}`));
