import OpenAI from "openai"
import { clerkClient  } from "@clerk/express";
import sql from "../config/db.js";

const AI = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai/"
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
            model:"gemini-3.5-flash",
            messages:[
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            temperature : 0.7,
            max_tokens : length
        })

        const generatedContent = response.choices[0].message.content;
        await sql`INSERT INTO creations (user_id, prompt, generated_content, type) VALUES (${userId}, ${prompt}, ${generatedContent}, 'article')`;

        if(plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
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