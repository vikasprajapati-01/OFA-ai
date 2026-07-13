import { clerkClient, getAuth } from '@clerk/express';

export const auth = async (req, res, next) => {
    try {
        const authState = getAuth(req);
        const { userId } = authState;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        // Step 1: Check premium plan from session JWT claims (no API call)
        let hasPremiumPlan = false;
        try {
            hasPremiumPlan = authState.has({ plan: 'premium' });
        } catch (planErr) {
            console.error('[Auth] has() error:', planErr.message);
        }

        // Step 2: Get user metadata from Clerk API
        let user = null;
        try {
            user = await clerkClient.users.getUser(userId);
        } catch (userErr) {
            console.error('[Auth] getUser() error:', userErr.message);
        }

        // Step 3: Set free_usage from metadata (or safe default)
        if (!hasPremiumPlan && user?.publicMetadata?.free_usage !== undefined) {
            req.free_usage = user.publicMetadata.free_usage;
        } else {
            req.free_usage = 0;
            // Only reset metadata if we successfully got the user and they're not premium
            if (!hasPremiumPlan && user) {
                try {
                    await clerkClient.users.updateUserMetadata(userId, {
                        publicMetadata: { free_usage: 0 }
                    });
                } catch (updateErr) {
                    console.error('[Auth] updateUserMetadata() error:', updateErr.message);
                }
            }
        }

        req.plan = hasPremiumPlan ? 'premium' : 'free';
        // console.log(`[Auth] userId=${userId} plan=${req.plan} free_usage=${req.free_usage}`);
        next();
    }
    catch (error) {
        console.error('[Auth] Fatal error:', error.message);
        res.json({ success: false, message: error.message });
    }
}
