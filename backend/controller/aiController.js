import OpenAI from "openai"
import { clerkClient  } from "@clerk/express";
import sql from "../config/db.js";
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
// import pdf from "pdf-parse";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

import axios from "axios";

const AI = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
})

export const generateArticle = async (req, res) => {
    try {
        const {userId} = req.auth();
        const { prompt, length } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if(plan !== 'premium' && free_usage >= 10) {
            return res.json({ success: false, message: 'Free usage limit reached. Please upgrade to premium plan.' });
        }

        const response = await AI.chat.completions.create({
            model:"gemini-2.5-flash",
            messages:[
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            temperature : 0.7
        })
        // console.log(response.choices);

        const generatedContent = response.choices[0].message.content;
        await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${generatedContent}, 'article')`;

        if(plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                publicMetadata: {
                    free_usage: free_usage + 1
                }
            })
        }

        res.json({ success: true, data: generatedContent });
    }
    catch (error) {
        console.error(error.message);
        res.json({ success : false, message: error.message });
    }
}


// Blog Title
export const generateBlogTitle = async (req, res) => {
    try {
        const {userId} = req.auth();
        const { prompt } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if(plan !== 'premium' && free_usage >= 10) {
            return res.json({ success: false, message: 'Free usage limit reached. Please upgrade to premium plan.' });
        }

        const response = await AI.chat.completions.create({
            model:"gemini-2.5-flash",
            messages:[{
                    "role": "user",
                    "content": prompt,
                },
            ],
            temperature : 0.7
        })

        const content = response.choices[0].message.content;
        await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${content}, 'blog-title')`;

        if(plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                publicMetadata: {
                    free_usage: free_usage + 1
                }
            })
        }

        res.json({ success: true, data: content });
    }
    catch (error) {
        console.error(error.message);
        res.json({ success : false, message: error.message });
    }
}

// Image
export const generateImage = async (req, res) => {
    try {
        const {userId} = req.auth();
        const { prompt } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if(plan !== 'premium' && free_usage >= 10) {
            return res.json({ success: false, message: 'Free usage limit reached. Please upgrade to premium plan.' });
        }

        const formData = new FormData()
        formData.append('prompt', prompt)

        const {data} = await axios.post("https://clipdrop-api.co/text-to-image/v1", formData, {
            headers: {
                'x-api-key': process.env.CLIPDROP_API_KEY,
            },
            responseType: 'arraybuffer',
        })

        const base64Image = `data:image/png;base64,${Buffer.from(data, 'binary').toString('base64')}`;

        const {secure_url} = await cloudinary.uploader.upload(base64Image)

        await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${secure_url}, 'image')`;

        if(plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                publicMetadata: {
                    free_usage: free_usage + 1
                }
            })
        }

        res.json({ success: true, data: secure_url });
    }
    catch (error) {
        console.error(error.message);
        res.json({ success : false, message: error.message });
    }
}

// Remove BG
export const removeImageBG = async (req, res) => {
    try {
        const {userId} = req.auth();
        const image = req.file;
        const plan = req.plan;

        if(plan !== 'premium') {
            return res.json({ success: false, message: 'Please upgrade to premium plan for this feature.' });
        }

        const {secure_url} = await cloudinary.uploader.upload(image.path, {
            transformation: [{
                effect: "background_removal",
                background_removal: "remove_the_background"
            }]
        });

        fs.unlink(image.path, (err) => { if (err) console.error('Temp file cleanup error:', err); });

        await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${"Remove background from image"}, ${secure_url}, 'image')`;

        res.json({ success: true, data: secure_url });
    }
    catch (error) {
        console.error(error.message);
        res.json({ success : false, message: error.message });
    }
}

// Remove Object
export const removeImageObject = async (req, res) => {
    try {
        const {userId} = req.auth();
        const { object } = req.body;
        const image = req.file;
        const plan = req.plan;

        if(plan !== 'premium') {
            return res.json({ success: false, message: 'Please upgrade to premium plan for this feature.' });
        }

        const {public_id} = await cloudinary.uploader.upload(image.path);

        fs.unlink(image.path, (err) => { if (err) console.error('Temp file cleanup error:', err); });

        const image_url = cloudinary.url(public_id, {
            transformation: [{
                effect: `gen_remove:${object}`,
            }],
            resource_type: 'image'
        })

        await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${`Removed ${object} from image`}, ${image_url}, 'image')`;

        res.json({ success: true, data: image_url });
    }
    catch (error) {
        console.error(error.message);
        res.json({ success : false, message: error.message });
    }
}

// Review Resume
export const reviewResume = async (req, res) => {
    try {
        const {userId} = req.auth();
        const resume = req.file;
        const plan = req.plan;

        if(plan !== 'premium') {
            return res.json({ success: false, message: 'Please upgrade to premium plan for this feature.' });
        }

        if(resume.size > 5 * 1024 * 1024) {
            return res.json({ success: false, message: 'File size exceeds the limit of 5MB.' });
        }

        const dataBuffer = fs.readFileSync(resume.path);
        const pdfData = await pdf(dataBuffer);

        fs.unlink(resume.path, (err) => { if (err) console.error('Temp file cleanup error:', err); });

        const prompt = `Review the following resume and provide constructive feedback on its strengths, weaknesses, and areas for improvement. Resume Content:\n\n${pdfData.text}`;

        const response = await AI.chat.completions.create({
            model:"gemini-2.5-flash",
            messages:[{
                    "role": "user",
                    "content": prompt,
                },
            ],
            temperature : 0.7
        })

        const content = response.choices[0].message.content;

        await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${"Review the uploaded resume"}, ${content}, 'resume-review')`;

        res.json({ success: true, data: content });
    }
    catch (error) {
        console.error(error.message);
        res.json({ success : false, message: error.message });
    }
}