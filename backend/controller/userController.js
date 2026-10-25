import sql from "../config/db.js";

export const getUserCreations = async (req, res) => {
    try {
        const { userId } = req.auth();

        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 100);
        const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);

        // Text content is NOT sent in the list (it can be 10KB+ per row).
        // Images are only a short URL, so we keep that.
        const [creations, countRows] = await Promise.all([
            sql`SELECT id, prompt, type, created_at, CASE WHEN type = 'image' THEN content ELSE NULL END AS content FROM creations WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`,
            sql`SELECT COUNT(*)::int AS total FROM creations WHERE user_id = ${userId}`
        ]);

        res.json({ success: true, creations, total: countRows[0].total });
    }
    catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: 'Could not load your creations. Please try again.' });
    }
}

// Loads the full content of ONE creation (only if it belongs to the signed-in user)
export const getCreationById = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { id } = req.params;

        if (!/^[\w-]{1,64}$/.test(id)) {
            return res.status(400).json({ success: false, message: 'Invalid creation id.' });
        }

        const rows = await sql`SELECT content FROM creations WHERE id = ${id} AND user_id = ${userId}`;

        if (!rows.length) {
            return res.status(404).json({ success: false, message: 'Creation not found.' });
        }

        res.json({ success: true, content: rows[0].content });
    }
    catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: 'Could not load this creation. Please try again.' });
    }
}