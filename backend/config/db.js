import { neon } from '@neondatabase/serverless';

// const sql = neon(`${process.env.DATABASE_URL}`);
let sql;
export let poolStats = null;   // test mode only: filled in below when local Postgres is used

if (process.env.LOAD_TEST === 'true' && process.env.LOCAL_DATABASE_URL) {
    // TEST ONLY: plain local Postgres (no Neon quota, no Neon network latency)
    const { default: pg } = await import('pg');
    const pool = new pg.Pool({ connectionString: process.env.LOCAL_DATABASE_URL, max: Number(process.env.PG_POOL_MAX) || 20 });
    poolStats = () => ({ total: pool.totalCount, idle: pool.idleCount, waiting: pool.waitingCount });

    // Same tagged-template style as neon(): sql`SELECT ... ${value}`
    sql = async (strings, ...values) => {
        const text = strings.reduce((acc, part, i) => acc + part + (i < values.length ? `$${i + 1}` : ''), '');
        const { rows } = await pool.query(text, values);
        return rows;
    };
    console.warn('WARNING: using LOCAL_DATABASE_URL (test mode), not Neon.');
} else {
    sql = neon(`${process.env.DATABASE_URL}`);
}

export const FREE_LIMIT = 10;

// Creates the usage row for a user if it does not exist yet.
export const ensureUsageRow = async (userId, initial = 0) => {
    await sql`INSERT INTO user_usage (user_id, free_usage) VALUES (${userId}, ${initial}) ON CONFLICT (user_id) DO NOTHING`;
};

// Returns the current free_usage, or null if the user has no row yet.
export const getFreeUsage = async (userId) => {
    const rows = await sql`SELECT free_usage FROM user_usage WHERE user_id = ${userId}`;
    return rows.length ? rows[0].free_usage : null;
};

// Atomically takes one free slot. Returns true if taken, false if the limit is reached.
export const reserveFreeUsage = async (userId) => {
    const rows = await sql`UPDATE user_usage SET free_usage = free_usage + 1 WHERE user_id = ${userId} AND free_usage < ${FREE_LIMIT} RETURNING free_usage`;
    return rows.length > 0;
};

// Gives a slot back when the request failed after the slot was taken.
export const refundFreeUsage = async (userId) => {
    await sql`UPDATE user_usage SET free_usage = GREATEST(free_usage - 1, 0) WHERE user_id = ${userId}`;
};

export default sql;