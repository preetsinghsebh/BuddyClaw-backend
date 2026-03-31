import fetch from 'node-fetch';
import { Telemetry } from './persistence.js';
import { enforceSafetyLayer } from '../ziva-service/src/safety/disclaimer.js'; // Use Ziva's robust layer

import { PERSONA_PROMPTS, getPersonaPrompt } from './persona-prompts.js';

const telemetry = new Telemetry('AIHandler');
const log = (msg) => telemetry.info(`[AIHandler] ${msg}`);

/**
 * GlobalAIQueue ensures only one LLM request is processed at a time
 * to prevent resource exhaustion and empty responses on low-tier instances.
 */
class GlobalAIQueue {
    constructor() {
        this.queue = [];
        this.processing = false;
    }

    async add(task, bot, chatId) {
        return new Promise((resolve, reject) => {
            this.queue.push({ task, resolve, reject, bot, chatId });
            this.process();
        });
    }

    async process() {
        if (this.processing || this.queue.length === 0) return;
        this.processing = true;

        const { task, resolve, reject, bot, chatId } = this.queue.shift();
        
        let typingInterval;
        if (bot && chatId) {
            // Heartbeat to keep 'typing' status alive in Telegram
            bot.sendChatAction(chatId, 'typing').catch(() => {});
            typingInterval = setInterval(() => {
                bot.sendChatAction(chatId, 'typing').catch(() => {});
            }, 4000);
        }

        try {
            const result = await task();
            resolve(result);
        } catch (e) {
            reject(e);
        } finally {
            if (typingInterval) clearInterval(typingInterval);
            this.processing = false;
            setImmediate(() => this.process());
        }
    }
}

export const aiQueue = new GlobalAIQueue();

/**
 * Enhanced Character Inference
 */
export async function getCharacterResponse(options) {
    const { 
        personaId, 
        userText, 
        history = [], 
        memory = "", 
        anchors = [], 
        profile = {}, 
        proxyUrl,
        isNudge = false,
        chatId = "unknown"
    } = options;

    if (!proxyUrl) {
        throw new Error("SARVAM_PROXY_URL is required but was not provided to AIHandler.");
    }

    // --- Dynamic Prompt Engineering ---
    const timeContext = `\n[Current Time (IST): ${new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })}]`;
    
    // Memory context aggregation
    let memoryContext = "";
    if (profile.nicknames?.length > 0) memoryContext += `\nYour nickname for user: ${profile.nicknames[profile.nicknames.length-1]}`;
    if (profile.facts?.length > 0) memoryContext += `\nFacts: ${profile.facts.join(', ')}`;
    
    const memoryString = memory ? `\n[LONG-TERM SUMMARY: ${memory}]` : "";
    const anchorString = anchors.length > 0 ? `\n[RECOLLECTIONS: ${anchors.join('; ')}]` : "";

    // Optimized Persona Rules from persona-prompts.js
    const personaRules = getPersonaPrompt(personaId);

    const systemPrompt = `PERSONA: ${personaId}\n${personaRules}\n\nGENERAL RULES: Informal, short (1-3 sentences), no AI disclaimers. Use emojis sparingly. Mirror user language (Hindi/Hinglish/English).${timeContext}${memoryContext}${memoryString}${anchorString}`;


    const messages = [{ role: 'system', content: systemPrompt }, ...history.slice(-10)];
    if (userText) messages.push({ role: 'user', content: userText });

    if (isNudge) {
        messages.push({ role: 'user', content: "Give me a very short, character-appropriate proactive nudge to send the user now. 1 sentence max." });
    }

    const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: 'sarvam-105b',
            messages,
            temperature: isNudge ? 0.9 : 0.7,
            stream: false
        }),
        timeout: 25000 // 25s for the big model
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(`Proxy Error (${response.status}): ${errData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";
    
    // Strip <think> tags
    content = content.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/<\/?think>/gi, '').trim();

    if (!content) throw new Error("LLM returned empty response");
    return content;
}

/**
 * Standardized Humanized Messenger
 */
export async function sendHumanizedResponse(options) {
    const { bot, chatId, text, personaId, safeSendMessage } = options;
    if (!text || !bot) return;

    // Split text into chunks for realistic messaging
    const chunks = text.match(/[^.!?\n]+[.!?\n]?/g) || [text];

    for (const chunk of chunks) {
        const trimmed = chunk.trim();
        if (!trimmed) continue;

        await bot.sendChatAction(chatId, 'typing').catch(() => {});
        
        // Artificial human-like delay (20-40ms per char + base 500-1500ms)
        const baseDelay = Math.random() * 1000 + 500;
        const charWeight = trimmed.length * (Math.random() * 20 + 20);
        const delay = Math.min(Math.max(baseDelay + charWeight, 800), 5000);
        await new Promise(r => setTimeout(r, delay));

        // Use the injected safeSendMessage or the bot directly
        const finalContent = enforceSafetyLayer("", trimmed);
        if (safeSendMessage) {
            await safeSendMessage(chatId, finalContent);
        } else {
            await bot.sendMessage(chatId, finalContent);
        }
    }
}
