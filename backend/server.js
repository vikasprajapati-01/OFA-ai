import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { clerkMiddleware } from '@clerk/express'

import cloudinaryConfig from './config/cloudinary.js';
import aiRouter from './routes/aiRoutes.js';
import userRouter from './routes/userRoutes.js';
import { monitorEventLoopDelay, createHistogram } from 'perf_hooks';
import { poolStats } from './config/db.js';

const app = express();

// ---------- TEST MODE SAFETY ----------
if (process.env.LOAD_TEST === 'true') {
    if (!process.env.LOAD_TEST_SECRET) {
        throw new Error('LOAD_TEST=true requires LOAD_TEST_SECRET to be set.');
    }
    if (process.env.CLERK_SECRET_KEY?.startsWith('sk_live')) {
        throw new Error('LOAD_TEST must never run with a live Clerk key.');
    }
    console.warn('WARNING: LOAD_TEST mode is ON (fake logins and fake AI responses are enabled).');
}

app.set('trust proxy', 1);

await cloudinaryConfig();

app.use(cors());

// TEST MODE: measure how long the server itself takes per endpoint
const stats = new Map();
if (process.env.LOAD_TEST === 'true') {
    app.use((req, res, next) => {
        const start = process.hrtime.bigint();
        res.on('finish', () => {
            const name = req.path.split('/').pop() || 'root';
            if (!stats.has(name)) stats.set(name, createHistogram());
            stats.get(name).record(Math.max(1, Math.round(Number(process.hrtime.bigint() - start) / 1000)));
        });
        next();
    });
}

app.use(compression());
app.use(express.json({ limit: '100kb' }));
app.use(clerkMiddleware())

// Per-user limit (falls back to IP when not signed in)
const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: Number(process.env.RATE_LIMIT_PER_MIN) || 60,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    keyGenerator: (req) => req.auth?.()?.userId || (process.env.LOAD_TEST === 'true' && req.headers['x-load-test-user']) || req.ip,
    validate: { keyGeneratorIpFallback: false },
    message: { success: false, message: 'Too many requests. Please slow down.' },
});

app.get('/', (req, res) => res.send('Server Live'));

app.use('/api', apiLimiter);
app.use('/api/ai', aiRouter);
app.use('/api/user', userRouter);

// Central error handler (multer errors, bad JSON, anything uncaught)
app.use((err, req, res, next) => {
    if (err?.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ success: false, message: 'File is too large (max 10MB).' });
    }
    console.error(err?.message);
    const status = err?.status >= 400 && err?.status < 500 ? err.status : 500;
    res.status(status).json({ success: false, message: status === 500 ? 'Something went wrong.' : 'Invalid request.' });
});

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Keep idle connections open longer than clients/proxies expect (avoids random connection resets)
server.keepAliveTimeout = 65 * 1000;
server.headersTimeout = 66 * 1000;

// TEST MODE: every 10s print event-loop delay, memory and server-side time per endpoint
if (process.env.LOAD_TEST === 'true') {
    const loop = monitorEventLoopDelay({ resolution: 10 });
    loop.enable();
    setInterval(() => {
        const m = process.memoryUsage();
        const ps = typeof poolStats === 'function' ? poolStats() : null;
        console.log(`[loop] p99=${(loop.percentile(99) / 1e6).toFixed(0)}ms max=${(loop.max / 1e6).toFixed(0)}ms | heap=${(m.heapUsed / 1048576).toFixed(0)}MB rss=${(m.rss / 1048576).toFixed(0)}MB${ps ? ` | pool total=${ps.total} idle=${ps.idle} waiting=${ps.waiting}` : ''}`);
        const parts = [...stats].map(([name, h]) => `${name} n=${h.count} p50=${(h.percentile(50) / 1000).toFixed(0)} p95=${(h.percentile(95) / 1000).toFixed(0)} max=${(h.max / 1000).toFixed(0)}`);
        if (parts.length) console.log(`[srv] ms: ${parts.join(' | ')}`);
        stats.forEach((h) => h.reset());
        loop.reset();
    }, 10000).unref();
}