import { getAuth } from '@clerk/express';

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
        let hasPremiumPlan = false;

        if (fake) {
            hasPremiumPlan = fake.premium;
            req.auth = () => ({ userId: fake.userId });
            req.isTestUser = true;
        } else {
            const authState = getAuth(req);

            if (!authState.userId) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }

            // Premium check comes from the session JWT claims (no API call, no DB call)
            try {
                hasPremiumPlan = authState.has({ plan: 'premium' });
            } catch (planErr) {
                console.error('[Auth] has() error:', planErr.message);
            }
        }

        req.plan = hasPremiumPlan ? 'premium' : 'free';
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