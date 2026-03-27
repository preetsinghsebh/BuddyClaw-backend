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
import { aiQueue, getCharacterResponse, sendHumanizedResponse as sharedSendResponse } from '../../shared/ai-handler.js';

export async function init(sharedApp = null, customToken = null, serviceName = 'liam') {
    const token = customToken || process.env.TELEGRAM_BOT_TOKEN;
// Note: aiQueue and processing logic moved to shared/ai-handler.js
    const telemetry = new Telemetry(serviceName);
    const log = (module, msg) => telemetry.info(`[${module}] ${msg}`);

    log('System', `${serviceName} Bot Orchestrator starting...`);
    // Note: Database connection is handled by the master service
    log('System', `${serviceName} Bot Orchestrator live.`);
    
    const bot = new TelegramBot(token, { polling: false }); // Start without polling first
    
    // Robust Webhook Clearing (Version-Agnostic)
    try {
        if (typeof bot.deleteWebhook === 'function') await bot.deleteWebhook({ drop_pending_updates: true });
        else if (typeof bot.deleteWebHook === 'function') await bot.deleteWebHook({ drop_pending_updates: true });
        else await bot.setWebHook(''); 
    } catch (e) {
        log('System', `Webhook clear failed (non-critical): ${e.message}`);
    }

    bot.startPolling();
    
    bot.on('polling_error', (err) => log('System', `Polling Error: ${err.message}`));

    // Track service start time to detect cold-start wake-ups
    const SERVICE_START_TIME = Date.now();
    const WARMUP_WINDOW_MS = 90_000;
    const warnedUsers = new Set();

    // State to track current persona, activity, and memory (Persisted via MongoDB)
    const userPersonas = new PersistentMap(User, { mode: 'mongo', service: serviceName });
    const userActivity = new PersistentMap(User, { mode: 'mongo', service: serviceName });
    const userProfiles = new PersistentMap(User, { mode: 'mongo', service: serviceName }); 
    const userSubscriptions = new PersistentMap(User, { mode: 'mongo', service: serviceName }); 
    const userMessageHistory = new PersistentMap(Chat, { mode: 'mongo', service: serviceName }); 
    const userChatHistory = new PersistentMap(Chat, { mode: 'mongo', service: serviceName }); 
    const userMemories = new PersistentMap(Memory, { mode: 'mongo', service: serviceName });
    const anchorMemories = new VectorMemory(Memory, { mode: 'mongo', service: serviceName });
    
    // Express Setup
    const router = express.Router();
    router.get('/health', (req, res) => res.status(200).json({ status: 'healthy', service: serviceName }));
    router.get('/api/profile/:chatId', verifyInternalToken, (req, res) => {
        const { chatId } = req.params;
        const profile = userProfiles.get(chatId) || { streakCount: 0, moodScore: 50 };
        const defaultPersona = (serviceName === 'zane') ? 'partner' : 'protective_bf';
        const personaId = userPersonas.get(chatId) || defaultPersona;
        const personaDisplayNames = { 'protective_bf': 'Liam', 'partner': 'Zane' };
        res.json({ ...profile, personaId, displayName: personaDisplayNames[personaId] });
    });

    if (sharedApp) {
        sharedApp.use(`/${serviceName}`, router);
        log('API', `${serviceName} Profile Sync mounted to /${serviceName}`);
    }

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

    const WEB_TO_INTERNAL_ID = {
        'liam': 'protective_bf',
        'zane': 'partner',
        'confident-zane': 'partner'
    };

    function getISTTime() {
        return new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    }

    function detectLanguage(text) {
        if (!text) return 'english';
        const hindiChars = (text.match(/[\u0900-\u097F]/g) || []).length;
        if (hindiChars > 0) return 'hindi';
        return 'english';
    }

    function detectOtherAI(text) {
        if (!text) return false;
        const triggers = ['chatgpt', 'openai', 'gemini', 'claude'];
        return triggers.some(t => text.toLowerCase().includes(t));
    }

// getCharacterResponse and sendHumanizedResponse logic moved to shared/ai-handler.js

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
                const defaultPersona = (serviceName === 'zane') ? 'partner' : 'protective_bf';
                let personaId = defaultPersona;
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

            const defaultPersona = (serviceName === 'zane') ? 'partner' : 'protective_bf';
            const personaId = userPersonas.get(chatId) || defaultPersona;
            
            const llmResponse = await aiQueue.add(
                async () => {
                    const history = userChatHistory.get(chatId) || [];
                    return getCharacterResponse({
                        personaId,
                        userText: text,
                        history,
                        proxyUrl: process.env.SARVAM_PROXY_URL,
                        chatId
                    });
                },
                bot,
                chatId
            );

            saveToHistory(chatId, 'assistant', llmResponse);
            
            await sharedSendResponse({
                bot,
                chatId,
                text: llmResponse,
                personaId,
                safeSendMessage
            });

        } catch (e) {
            log(`TG-${msg.chat.id}`, `Error: ${e.message}`);
            safeSendMessage(msg.chat.id, "oops, something went wrong.");
        }
    });

    bot.onText(/\/interpret (.+)/, async (msg, match) => {
        const chatId = msg.chat.id;
        const dream = match[1];
        const defaultPersona = (serviceName === 'zane') ? 'partner' : 'protective_bf';
        const personaId = userPersonas.get(chatId) || defaultPersona;
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
            const defaultPersona = (serviceName === 'zane') ? 'partner' : 'protective_bf';
            const personaId = userPersonas.get(chatId) || defaultPersona;

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
