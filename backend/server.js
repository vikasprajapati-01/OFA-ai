import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { clerkMiddleware } from '@clerk/express'

import cloudinaryConfig from './config/cloudinary.js';
import aiRouter from './routes/aiRoutes.js';
import userRouter from './routes/userRoutes.js';

const app = express();

app.set('trust proxy', 1);

await cloudinaryConfig();

app.use(cors());
app.use(compression());
app.use(express.json({ limit: '100kb' }));
app.use(clerkMiddleware())

// Per-user limit (falls back to IP when not signed in)
const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: Number(process.env.RATE_LIMIT_PER_MIN) || 60,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    keyGenerator: (req) => req.auth?.()?.userId || req.ip,
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

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));