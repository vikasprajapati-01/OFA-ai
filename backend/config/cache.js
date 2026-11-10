import Redis from 'ioredis';

// Counters printed every 10 s in test mode (see server.js)
export const cacheStats = { hit: 0, miss: 0, err: 0 };

const TTL_SECONDS = Number(process.env.CACHE_TTL_SECONDS) || 30;

// No REDIS_URL = cache is simply turned off (e.g. on Vercel)
let redis = null;
if (process.env.REDIS_URL) {
    redis = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 1,     // fail fast, then fall back to the database
        enableOfflineQueue: false,
        connectTimeout: 2000,
    });
    redis.on('error', () => { cacheStats.err++; });
}

const keyFor = (userId) => `creations:${userId}`;

export const getCachedList = async (userId, field) => {
    if (!redis) return null;
    try {
        const value = await redis.hget(keyFor(userId), field);
        if (value) cacheStats.hit++; else cacheStats.miss++;
        return value;
    } catch {
        cacheStats.err++;
        return null;
    }
};

// Not awaited by the caller: saving to the cache must never slow the response
export const setCachedList = (userId, field, body) => {
    if (!redis) return;
    redis.multi()
        .hset(keyFor(userId), field, body)
        .expire(keyFor(userId), TTL_SECONDS)
        .exec()
        .catch(() => { cacheStats.err++; });
};

export const invalidateCreations = async (userId) => {
    if (!redis) return;
    try {
        await redis.del(keyFor(userId));
    } catch {
        cacheStats.err++;
    }
};