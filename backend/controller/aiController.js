import OpenAI from "openai"
import sql, { reserveFreeUsage, refundFreeUsage } from "../config/db.js";
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import { createRequire } from "module";
import axios from "axios";

const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

const AI = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    timeout: 60 * 1000,
    maxRetries: 1
})

const MAX_PROMPT_LENGTH = 4000;

// ---------- TEST MODE (only active when LOAD_TEST=true in the env file) ----------
const LOAD_TEST = process.env.LOAD_TEST === 'true';
const FAKE_AI_DELAY_MS = Number(process.env.FAKE_AI_DELAY_MS) || 800;
const FAKE_IMAGE_DELAY_MS = Number(process.env.FAKE_IMAGE_DELAY_MS) || 2000;
const FAKE_UPLOAD_DELAY_MS = Number(process.env.FAKE_UPLOAD_DELAY_MS) || 500;
const FAKE_IMAGE_URL = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';
const FAKE_TEXT = 'This is a simulated AI response used for load testing. '.repeat(80);
const FAKE_PNG_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ---------- External calls (real normally, fake in test mode) ----------
const getAiText = async (prompt) => {
    if (LOAD_TEST) {
        await sleep(FAKE_AI_DELAY_MS);
        return FAKE_TEXT;
    }
    const response = await AI.chat.completions.create({
        model: "gemini-2.5-flash",
        messages: [{ "role": "user", "content": prompt }],
        temperature: 0.7
    })
    return response.choices[0].message.content;
};

const getClipdropImage = async (prompt) => {
    if (LOAD_TEST) {
        await sleep(FAKE_IMAGE_DELAY_MS);
        return FAKE_PNG_BASE64;
    }
    const formData = new FormData()
    formData.append('prompt', prompt)

    const { data } = await axios.post("https://clipdrop-api.co/text-to-image/v1", formData, {
        headers: {
            'x-api-key': process.env.CLIPDROP_API_KEY,
        },
        responseType: 'arraybuffer',
        timeout: 60 * 1000,
    })

    return `data:image/png;base64,${Buffer.from(data, 'binary').toString('base64')}`;
};

const cloudUpload = async (file, options) => {
    if (LOAD_TEST) {
        await sleep(FAKE_UPLOAD_DELAY_MS);
        return { secure_url: FAKE_IMAGE_URL, public_id: 'fake_public_id' };
    }
    return cloudinary.uploader.upload(file, options);
};

// ---------- Helpers ----------

const isValidPrompt = (prompt) =>
    typeof prompt === 'string' && prompt.trim().length > 0 && prompt.length <= MAX_PROMPT_LENGTH;

const removeTempFile = (file) => {
    if (file?.path) {
        fs.promises.unlink(file.path).catch((err) => console.error('Temp file cleanup error:', err.message));
    }
};

const sendError = (res, error) => {
    console.error(error.message);
    if (error.status === 429) {
        return res.status(429).json({ success: false, message: 'The AI service is busy right now. Please try again in a moment.' });
    }
    return res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
};

// Free users: atomically take a usage slot BEFORE doing the work.
// Returns null (response already sent) if the limit is reached.
const takeFreeSlot = async (req, res) => {
    if (req.plan === 'premium') return { reserved: false };

    const { userId } = req.auth();
    const reserved = await reserveFreeUsage(userId);
    if (!reserved) {
        res.status(403).json({ success: false, message: 'Free usage limit reached. Please upgrade to premium plan.' });
        return null;
    }
    return { reserved: true };
};

const refundSlot = (userId) =>
    refundFreeUsage(userId).catch((err) => console.error('Usage refund failed:', err.message));

// Shared by article + blog title
const generateText = async (req, res, type) => {
    const { userId } = req.auth();
    let reserved = false;

    try {
        const { prompt } = req.body || {};

        if (!isValidPrompt(prompt)) {
            return res.status(400).json({ success: false, message: `Prompt is required and must be under ${MAX_PROMPT_LENGTH} characters.` });
        }

        const slot = await takeFreeSlot(req, res);
        if (!slot) return;
        reserved = slot.reserved;

        const content = await getAiText(prompt);

        await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${content}, ${type})`;

        res.json({ success: true, data: content });
    }
    catch (error) {
        if (reserved) await refundSlot(userId);
        sendError(res, error);
    }
}

export const generateArticle = (req, res) => generateText(req, res, 'article');

export const generateBlogTitle = (req, res) => generateText(req, res, 'blog-title');

// Image
export const generateImage = async (req, res) => {
    const { userId } = req.auth();
    let reserved = false;

    try {
        const { prompt } = req.body || {};

        if (!isValidPrompt(prompt)) {
            return res.status(400).json({ success: false, message: `Prompt is required and must be under ${MAX_PROMPT_LENGTH} characters.` });
        }

        const slot = await takeFreeSlot(req, res);
        if (!slot) return;
        reserved = slot.reserved;

        const base64Image = await getClipdropImage(prompt);

        const { secure_url } = await cloudUpload(base64Image)

        await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${secure_url}, 'image')`;

        res.json({ success: true, data: secure_url });
    }
    catch (error) {
        if (reserved) await refundSlot(userId);
        sendError(res, error);
    }
}

// Remove BG (premium check is done in the route, before the upload)
export const removeImageBG = async (req, res) => {
    const image = req.file;

    try {
        const { userId } = req.auth();

        if (!image) {
            return res.status(400).json({ success: false, message: 'Image is required.' });
        }

        const { secure_url } = await cloudUpload(image.path, {
            transformation: [{
                effect: "background_removal",
                background_removal: "remove_the_background"
            }]
        });

        await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${"Remove background from image"}, ${secure_url}, 'image')`;

        res.json({ success: true, data: secure_url });
    }
    catch (error) {
        sendError(res, error);
    }
    finally {
        removeTempFile(image);
    }
}

// Remove Object (premium check is done in the route, before the upload)
export const removeImageObject = async (req, res) => {
    const image = req.file;

    try {
        const { userId } = req.auth();
        const { object } = req.body || {};

        if (!image) {
            return res.status(400).json({ success: false, message: 'Image is required.' });
        }

        if (typeof object !== 'string' || !object.trim() || object.length > 100) {
            return res.status(400).json({ success: false, message: 'Please describe the object in a single word.' });
        }

        const { public_id } = await cloudUpload(image.path);

        const image_url = cloudinary.url(public_id, {
            transformation: [{
                effect: `gen_remove:${object.trim()}`,
            }],
            resource_type: 'image'
        })

        await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${`Removed ${object.trim()} from image`}, ${image_url}, 'image')`;

        res.json({ success: true, data: image_url });
    }
    catch (error) {
        sendError(res, error);
    }
    finally {
        removeTempFile(image);
    }
}

// Review Resume (premium check is done in the route, before the upload)
export const reviewResume = async (req, res) => {
    const resume = req.file;

    try {
        const { userId } = req.auth();

        if (!resume) {
            return res.status(400).json({ success: false, message: 'Resume file is required.' });
        }

        if (resume.mimetype !== 'application/pdf') {
            return res.status(400).json({ success: false, message: 'Only PDF files are supported.' });
        }

        if (resume.size > 5 * 1024 * 1024) {
            return res.status(413).json({ success: false, message: 'File size exceeds the limit of 5MB.' });
        }

        const dataBuffer = await fs.promises.readFile(resume.path);
        const pdfData = await pdf(dataBuffer);

        const resumeText = pdfData.text.slice(0, 20000);

        const prompt = `Review the following resume and provide constructive feedback on its strengths, weaknesses, and areas for improvement. Resume Content:\n\n${resumeText}`;

        // const response = await AI.chat.completions.create({
        //     model: "gemini-2.5-flash",
        //     messages: [{ "role": "user", "content": prompt }],
        //     temperature: 0.7
        // })

        const content = await getAiText(prompt);

        await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${"Review the uploaded resume"}, ${content}, 'resume-review')`;

        res.json({ success: true, data: content });
    }
    catch (error) {
        sendError(res, error);
    }
    finally {
        removeTempFile(resume);
    }
}