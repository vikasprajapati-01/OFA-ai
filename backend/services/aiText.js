import OpenAI from "openai";

const AI = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    timeout: 60 * 1000,
    maxRetries: 1
});

// TEST MODE (only when LOAD_TEST=true): fake AI so load tests cost nothing
const LOAD_TEST = process.env.LOAD_TEST === 'true';
const FAKE_AI_DELAY_MS = Number(process.env.FAKE_AI_DELAY_MS) || 800;
const FAKE_AI_FAIL_RATE = Number(process.env.FAKE_AI_FAIL_RATE) || 0;
const FAKE_TEXT = 'This is a simulated AI response used for load testing. '.repeat(80);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const getAiText = async (prompt) => {
    if (LOAD_TEST) {
        await sleep(FAKE_AI_DELAY_MS);
        if (Math.random() < FAKE_AI_FAIL_RATE) throw new Error('simulated AI failure');
        return FAKE_TEXT;
    }
    const response = await AI.chat.completions.create({
        model: "gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
    });
    return response.choices[0].message.content;
};