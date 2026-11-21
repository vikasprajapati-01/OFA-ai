import { getQueue } from '../config/queue.js';
import { refundFreeUsage } from '../config/db.js';
import { isValidPrompt, takeFreeSlot, MAX_PROMPT_LENGTH } from './aiController.js';

// Validate, take a free-usage slot, put a job card in the queue, answer right away with its id
const enqueueText = (type) => async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt } = req.body || {};

        if (!isValidPrompt(prompt)) {
            return res.status(400).json({ success: false, message: `Prompt is required and must be under ${MAX_PROMPT_LENGTH} characters.` });
        }

        const slot = await takeFreeSlot(req, res);
        if (!slot) return;

        try {
            const job = await getQueue().add(type, { userId, prompt, type, reserved: slot.reserved });
            return res.status(202).json({ success: true, jobId: job.id });
        } catch (err) {
            if (slot.reserved) await refundFreeUsage(userId).catch((e) => console.error('Usage refund failed:', e.message));
            throw err;
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: 'Could not queue the request. Please try again.' });
    }
};

export const enqueueArticle = enqueueText('article');
export const enqueueBlogTitle = enqueueText('blog-title');

// Poll this until state is "completed" (or "failed")
export const getJobStatus = async (req, res) => {
    try {
        const { userId } = req.auth();
        const job = await getQueue().getJob(req.params.id);

        if (!job || job.data.userId !== userId) {
            return res.status(404).json({ success: false, message: 'Job not found.' });
        }

        const state = await job.getState();
        if (state === 'completed') {
            return res.json({ success: true, state, data: job.returnvalue?.content });
        }
        if (state === 'failed') {
            return res.json({ success: true, state, message: 'Generation failed. Your free usage was not counted.' });
        }
        res.json({ success: true, state });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: 'Could not read the job status.' });
    }
};