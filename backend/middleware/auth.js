import { clerkClient, getAuth } from '@clerk/express';
import { getFreeUsage, ensureUsageRow } from '../config/db.js';

const LOAD_TEST = process.env.LOAD_TEST === 'true';

// TEST ONLY: fake login through headers. Active only when LOAD_TEST=true
// and the secret header matches LOAD_TEST_SECRET.
const getFakeUser = (req) => {
    if (!LOAD_TEST) return null;
    const userId = req.headers['x-load-test-user'];
    const secret = req.headers['x-load-test-secret'];
    if (!userId || !secret || secret !== process.env.LOAD_TEST_SECRET) return null;
    return { userId, premium: req.headers['x-load-test-plan'] === 'premium' };
};

export const auth = async (req, res, next) => {
    try {
        const fake = getFakeUser(req);
        let userId;
        let hasPremiumPlan = false;

        if (fake) {
            userId = fake.userId;
            hasPremiumPlan = fake.premium;
            req.auth = () => ({ userId });
        } else {
            const authState = getAuth(req);
            userId = authState.userId;

            if (!userId) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }

            // Premium check comes from the session JWT claims (no API call)
            try {
                hasPremiumPlan = authState.has({ plan: 'premium' });
            } catch (planErr) {
                console.error('[Auth] has() error:', planErr.message);
            }
        }

        req.plan = hasPremiumPlan ? 'premium' : 'free';

        if (hasPremiumPlan) {
            req.free_usage = 0;
            return next();
        }

        // Free users: usage lives in our own DB (one fast query, no Clerk API call)
        let used = await getFreeUsage(userId);

        if (used === null) {
            // First time we see this user: seed once from the old Clerk metadata
            // so existing users keep their current count. (Fake test users start at 0.)
            let seed = 0;
            if (!fake) {
                try {
                    const user = await clerkClient.users.getUser(userId);
                    const old = user?.publicMetadata?.free_usage;
                    if (typeof old === 'number') seed = old;
                } catch (userErr) {
                    console.error('[Auth] getUser() error:', userErr.message);
                    return res.status(503).json({ success: false, message: 'Service temporarily unavailable. Please retry.' });
                }
            }
            await ensureUsageRow(userId, seed);
            used = await getFreeUsage(userId);
        }

        req.free_usage = used ?? 0;
        next();
    }
    catch (error) {
        console.error('[Auth] Fatal error:', error.message);
        res.status(500).json({ success: false, message: 'Authentication failed. Please try again.' });
    }
}

// Use before upload middleware so non-premium users never write files to disk
export const requirePremium = (req, res, next) => {
    if (req.plan !== 'premium') {
        return res.status(403).json({ success: false, message: 'Please upgrade to premium plan for this feature.' });
    }
    next();
}