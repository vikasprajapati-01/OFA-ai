import client from 'prom-client';
import { poolStats } from './db.js';

// Node basics: event-loop lag, memory, CPU, garbage collection
client.collectDefaultMetrics();

const httpDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Server-side time to answer a request',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 0.6, 0.75, 0.9, 1, 1.5, 2, 2.5, 2.6, 3, 5, 10],
});

new client.Gauge({
    name: 'db_pool_connections',
    help: 'Postgres pool connections by state (local test pool only)',
    labelNames: ['state'],
    collect() {
        const s = typeof poolStats === 'function' ? poolStats() : null;
        if (!s) return;
        this.set({ state: 'total' }, s.total);
        this.set({ state: 'idle' }, s.idle);
        this.set({ state: 'waiting' }, s.waiting);
    },
});

export function metricsMiddleware(req, res, next) {
    if (req.path === '/metrics') return next();
    const end = httpDuration.startTimer();
    res.on('finish', () => {
        const route = req.route ? `${req.baseUrl}${req.route.path}` : 'unmatched';
        end({ method: req.method, route, status_code: res.statusCode });
    });
    next();
}

export async function metricsHandler(req, res) {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
}