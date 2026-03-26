import OpenAI from 'openai';

// SARVAM PROXY ADAPTER SUCCESSFULLY RUNNING
// OpenClaw → localhost:3000/v1 proxy → Sarvam AI (sarvam-105b model)
// Proxy command: node adapter.js (keep running in sarvam-proxy folder)
// Bypasses direct compatibility issues — API key loaded from .env

/**
 * Initializes the API client pointing to our local Express Proxy
 * @param {string} userApiKey - The user's specific key, or the shared project key
 * @returns {OpenAI} configured client
 */
export const createSarvamClient = (userApiKey) => {
    return new OpenAI({
        baseURL: 'http://localhost:3000/v1', // 👈 Redirected to local proxy adapter
        apiKey: userApiKey, // Proxy will extract this from Bearer token
    });
};

/**
 * Calls the local proxy to forward to sarvam-105b API for chat completions
 * @param {OpenAI} client - Configured client hitting localhost:3000
 * @param {string} systemPrompt - The full system prompt configured for this account
 * @param {Array<{role: string, content: string}>} history - Previous messages
 * @param {string} userMessage - Latest user message
 * @returns {Promise<string>} The AI's response text
 */
export const getSarvamResponse = async (client, systemPrompt, history, userMessage) => {
    try {
        const messages = [
            { role: 'system', content: systemPrompt },
            ...history,
            { role: 'user', content: userMessage }
        ];

        console.log(`[Engine->Proxy] Invoking local proxy for sarvam-105b with ${messages.length} messages.`);

        // This hits localhost:3000/v1/chat/completions natively mapped by our express server
        const response = await client.chat.completions.create({
            model: 'sarvam-105b',
            messages: messages,
            temperature: 0.7,
            max_tokens: 600,
        });

        return response.choices[0]?.message?.content || "Sorry, I couldn't process that.";
    } catch (err) {
        console.error(`[Engine Error] Proxy Connection Failed:`, err.message);
        throw err;
    }
};
