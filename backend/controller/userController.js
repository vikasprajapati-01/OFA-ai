import sql from "../config/db.js";

export const getUserCreations = async (req, res) => {
    try {
        const { userId } = req.auth();

        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 100);
        const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);

        const [creations, countRows] = await Promise.all([
            sql`SELECT * FROM creations WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`,
            sql`SELECT COUNT(*)::int AS total FROM creations WHERE user_id = ${userId}`
        ]);

        res.json({ success: true, creations, total: countRows[0].total });
    }
    catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: 'Could not load your creations. Please try again.' });
    }
}