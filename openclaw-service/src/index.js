import '../../shared/env.js';
import TelegramBot from 'node-telegram-bot-api';
import fetch from 'node-fetch';
import axios from 'axios';
import cron from 'node-cron';
import express from 'express';
import cors from 'cors';
import { enforceSafetyLayer, detectCrisis } from './safety/disclaimer.js';
import { PersistentMap, VectorMemory, Telemetry } from '../../shared/persistence.js';
import { connectDB } from '../../shared/database.js';
import { apiLimiter, verifyInternalToken } from '../../shared/security.js';
import User from '../../shared/models/User.js';
import Memory from '../../shared/models/Memory.js';
import Chat from '../../shared/models/Chat.js';

// Setup production-grade telemetry
// Setup production-grade telemetry
export async function init(sharedApp = null, customToken = null, serviceName = 'openclaw') {
    const token = customToken || process.env.TELEGRAM_BOT_TOKEN;
    let PROXY_URL = process.env.SARVAM_PROXY_URL || 'http://localhost:3000/v1/chat/completions';

    if (!token) {
        console.error(`[${serviceName}] WARNING: TELEGRAM_BOT_TOKEN is missing`);
        return;
    }

    const telemetry = new Telemetry(serviceName);
    const log = (module, msg) => telemetry.info(`[${module}] ${msg}`);

    log('System', `${serviceName} Bot Orchestrator starting...`);
    
    const bot = new TelegramBot(token, { polling: true });
    bot.on('polling_error', (err) => log('System', `Polling Error: ${err.message}`));

    const SERVICE_START_TIME = Date.now();
    const WARMUP_WINDOW_MS = 90_000; 
    const warnedUsers = new Set();

    // State
    const userPersonas = new PersistentMap(User, { mode: 'mongo', service: serviceName });
    const userActivity = new PersistentMap(User, { mode: 'mongo', service: serviceName });
    const userProfiles = new PersistentMap(User, { mode: 'mongo', service: serviceName }); 
    const userSubscriptions = new PersistentMap(User, { mode: 'mongo', service: serviceName }); 
    const userMessageHistory = new PersistentMap(Chat, { mode: 'mongo', service: serviceName }); 
    const userChatHistory = new PersistentMap(Chat, { mode: 'mongo', service: serviceName }); 
    const userMemories = new PersistentMap(Memory, { mode: 'mongo', service: serviceName });
    const anchorMemories = new VectorMemory(Memory, { mode: 'mongo', service: serviceName });

    const WEB_TO_INTERNAL_ID = {
        'midnight': 'midnight',
        'roaster': 'roaster',
        'bestie': 'bestie'
    };

    const personaDisplayNames = {
        'midnight': 'Midnight',
        'roaster': 'Roaster',
        'bestie': 'Bestie'
    };

    // Helper Functions
    function trackMessage(chatId, messageId) {
        if (!messageId) return;
        const history = userMessageHistory.get(chatId) || [];
        history.push(messageId);
        if (history.length > 50) history.shift();
        userMessageHistory.set(chatId, history);
    }

    async function safeSendMessage(chatId, text, options = {}) {
        try {
            const msg = await bot.sendMessage(chatId, text, options);
            trackMessage(chatId, msg.message_id);
            return msg;
        } catch (e) {
            log(`TG-${chatId}`, `safeSendMessage Error: ${e.message}`);
            throw e;
        }
    }

    function saveToHistory(chatId, role, content) {
        if (!chatId || !content) return;
        const history = userChatHistory.get(chatId) || [];
        history.push({ role, content });
        if (history.length > 15) history.shift();
        userChatHistory.set(chatId, history);
    }

    async function clearChatHistory(chatId) {
        const history = userMessageHistory.get(chatId) || [];
        if (history.length === 0) return;
        const deletePromises = history.map(msgId => bot.deleteMessage(chatId, msgId).catch(() => {}));
        await Promise.all(deletePromises);
        userMessageHistory.set(chatId, []);
    }

    // Express Setup
    const router = express.Router();
    router.get('/health', (req, res) => res.status(200).json({ status: 'healthy', service: serviceName }));
    router.get('/api/profile/:chatId', verifyInternalToken, (req, res) => {
        const { chatId } = req.params;
        const profile = userProfiles.get(chatId) || { streakCount: 0, moodScore: 50 };
        const personaId = userPersonas.get(chatId) || 'midnight';
        res.json({ ...profile, personaId, displayName: personaDisplayNames[personaId] });
    });

    if (sharedApp) {
        sharedApp.use(`/${serviceName}`, router);
        log('API', `${serviceName} Profile Sync mounted to /${serviceName}`);
    }

    async function getCharacterResponse(personaId, userText, isNudge = false, chatId = null) {
        const detectedLang = detectLanguage(userText);
        const systemPrompt = `PERSONA:${personaId}\nReply in ${detectedLang}. Be a chaotic, funny companion. 1-2 sentences.`;
        const history = chatId ? (userChatHistory.get(chatId) || []) : [];
        const messages = [{ role: 'system', content: systemPrompt }, ...history.slice(-10), { role: 'user', content: userText }];

        const response = await fetch(PROXY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: 'sarvam-105b', messages, temperature: 0.9, stream: false }),
            timeout: 15000
        });

        const data = await response.json();
        if (!response.ok) throw new Error(`Proxy Error: ${data.status}`);
        
        let content = data.choices?.[0]?.message?.content || "";
        content = content.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/<\/?think>/gi, '').trim();
        return content;
    }

    async function sendHumanizedResponse(chatId, text, personaId) {
        if (!text) return;
        await bot.sendChatAction(chatId, 'typing');
        const delay = Math.min(Math.max(text.length * 30, 800), 3000);
        await new Promise(r => setTimeout(r, delay));
        await safeSendMessage(chatId, enforceSafetyLayer("", text));
    }

    bot.on('message', async (msg) => {
        try {
            const chatId = msg.chat.id;
            const text = msg.text || msg.caption;
            if (!text) return;

            userActivity.set(chatId, Date.now());
            trackMessage(chatId, msg.message_id);

            // 🌅 Cold-start wake-up notification
            if (Date.now() - SERVICE_START_TIME < WARMUP_WINDOW_MS && !warnedUsers.has(chatId)) {
                warnedUsers.add(chatId);
                await safeSendMessage(chatId, `☕ *Just waking up!*\n\nI was resting to save energy. Give me a few seconds to get ready — I'll reply right after! 🌸`, { parse_mode: 'Markdown' });
            }

            if (text.startsWith('/start')) {
                const startParam = text.split(' ')[1];
                let personaId = 'midnight';
                if (startParam && startParam.startsWith('persona_')) {
                    const req = startParam.replace('persona_', '');
                    personaId = WEB_TO_INTERNAL_ID[req] || req;
                    await clearChatHistory(chatId);
                    userPersonas.set(chatId, personaId);
                }
                const welcome = await getCharacterResponse(personaId, "Greet the user.", false);
                await sendHumanizedResponse(chatId, welcome, personaId);
                return;
            }

            const personaId = userPersonas.get(chatId) || 'midnight';
            const llmResponse = await getCharacterResponse(personaId, text, false, chatId);
            saveToHistory(chatId, 'assistant', llmResponse);
            await sendHumanizedResponse(chatId, llmResponse, personaId);

        } catch (e) {
            log(`TG-${msg.chat.id}`, `Error: ${e.message}`);
            safeSendMessage(msg.chat.id, "oops, something went wrong.");
        }
    });

    bot.onText(/\/interpret (.+)/, async (msg, match) => {
        const chatId = msg.chat.id;
        const dream = match[1];
        const personaId = userPersonas.get(chatId) || 'midnight';
        log(`TG-${chatId}`, `Dream Interpretation Requested`);
        const prompt = `I just had a dream: "${dream}". As my companion, interpret this dream for me in your unique character style.`;
        const response = await getCharacterResponse(personaId, prompt, false, chatId);
        saveToHistory(chatId, 'assistant', response);
        await sendHumanizedResponse(chatId, `🌙 *Dreamscape:* ${response}`, personaId);
    });

    /**
     * Proactive Scheduler (Cron Job)
     */
    const NUDGE_INTERVAL_HOUR = parseInt(process.env.PROACTIVE_INTERVAL_HOURS || '6');
    cron.schedule('0 * * * *', async () => {
        log('Scheduler', `Running proactive check...`);
        const now = Date.now();
        const twentyFourHours = 24 * 60 * 60 * 1000;
        const nudgeIntervalMs = NUDGE_INTERVAL_HOUR * 60 * 60 * 1000;

        for (const [chatId, lastActive] of userActivity.entries()) {
            const timeSinceActive = now - lastActive;
            const personaId = userPersonas.get(chatId) || 'midnight';

            if (timeSinceActive > nudgeIntervalMs && timeSinceActive < twentyFourHours) {
                try {
                    const nudge = await getCharacterResponse(personaId, "", true, chatId);
                    saveToHistory(chatId, 'assistant', nudge);
                    await sendHumanizedResponse(chatId, nudge, personaId);
                    userActivity.set(chatId, now);
                } catch (e) {
                    log(`TG-${chatId}`, `Scheduler Fail: ${e.message}`);
                }
            }
        }
    });

    process.on('SIGINT', () => {
        if (bot) bot.stopPolling();
        process.exit();
    });

    log('System', `${serviceName} Bot Orchestrator live.`);
}

function detectLanguage(text) {
    if (!text) return 'english';
    const hindiChars = (text.match(/[\u0900-\u097F]/g) || []).length;
    if (hindiChars > 0) return 'hindi';
    return 'english';
}
