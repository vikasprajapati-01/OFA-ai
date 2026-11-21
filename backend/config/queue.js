import { Queue } from 'bullmq';

export const QUEUE_NAME = 'ai-text';

// Plain connection options: BullMQ creates its own Redis client from these
export const redisConnection = () => {
    const u = new URL(process.env.REDIS_URL);
    return {
        host: u.hostname,
        port: Number(u.port) || 6379,
        username: u.username || undefined,
        password: u.password ? decodeURIComponent(u.password) : undefined,
        ...(u.protocol === 'rediss:' ? { tls: {} } : {}),
        maxRetriesPerRequest: null,
    };
};

// Up to 3 tries, waiting 1 s then 2 s between them; old jobs are cleaned up
export const JOB_OPTIONS = {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: { age: 3600, count: 1000 },
    removeOnFail: { age: 86400, count: 1000 },
};

let queue = null;
export const getQueue = () => {
    if (!queue) {
        queue = new Queue(QUEUE_NAME, { connection: redisConnection(), defaultJobOptions: JOB_OPTIONS });
    }
    return queue;
};