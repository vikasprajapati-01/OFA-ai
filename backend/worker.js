import 'dotenv/config';
import { Worker } from 'bullmq';
import sql, { refundFreeUsage } from './config/db.js';
import { invalidateCreations } from './config/cache.js';
import { getAiText } from './services/aiText.js';
import { QUEUE_NAME, redisConnection } from './config/queue.js';

if (!process.env.REDIS_URL) throw new Error('worker.js needs REDIS_URL.');
if (process.env.VERCEL) throw new Error('The worker must never run on Vercel.');

const CONCURRENCY = Number(process.env.WORKER_CONCURRENCY) || 5;

// One job = one AI call + one database insert. Runs up to CONCURRENCY jobs at the same time.
const worker = new Worker(QUEUE_NAME, async (job) => {
    const { userId, prompt, type } = job.data;
    const content = await getAiText(prompt);
    await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${content}, ${type})`;
    await invalidateCreations(userId);
    return { content };
}, { connection: redisConnection(), concurrency: CONCURRENCY });

let done = 0;
worker.on('completed', () => { done++; });

worker.on('failed', async (job, err) => {
    if (!job) return;
    console.error(`[worker] job ${job.id} attempt ${job.attemptsMade}/${job.opts.attempts} failed: ${err.message}`);
    // Give the free-usage slot back only after the last attempt has failed
    if (job.attemptsMade >= (job.opts.attempts ?? 1) && job.data.reserved) {
        await refundFreeUsage(job.data.userId).catch((e) => console.error('[worker] refund failed:', e.message));
    }
});

worker.on('error', (err) => console.error('[worker] error:', err.message));

setInterval(() => console.log(`[worker] completed so far: ${done}`), 10000).unref();
console.log(`[worker] started: queue=${QUEUE_NAME} concurrency=${CONCURRENCY}`);

// Graceful stop: finish the jobs that are running, then exit
let shuttingDown = false;
const shutdown = async (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`[worker] ${signal} received: finishing active jobs, then exiting`);
    await worker.close();
    console.log('[worker] closed');
    process.exit(0);
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));