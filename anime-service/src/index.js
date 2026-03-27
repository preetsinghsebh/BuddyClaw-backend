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

// Setup production-grade telemetry
// Setup production-grade telemetry
export async function init(sharedApp = null, customToken = null, serviceName = 'anime') {
    const token = customToken || process.env.TELEGRAM_BOT_TOKEN;
// Note: aiQueue and processing logic moved to shared/ai-handler.js
    const telemetry = new Telemetry(serviceName);
    const log = (module, msg) => telemetry.info(`[${module}] ${msg}`);
    
    const bot = new TelegramBot(token, { polling: false });
    
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
        'strongest-sorcerer': 'anime_gojo',
        'explosive-rival': 'anime_bakugo',
        'pirate-king': 'anime_luffy',
        'ninja-way': 'anime_naruto',
        'ghoul-tragedy': 'anime_kaneki',
        'moon-spirit': 'anime_ghost'
    };

    const personaDisplayNames = {
        'anime_gojo': 'Satoru Gojo',
        'anime_bakugo': 'Katsuki Bakugo',
        'anime_luffy': 'Monkey D. Luffy',
        'anime_naruto': 'Naruto Uzumaki',
        'anime_kaneki': 'Ken Kaneki',
        'anime_ghost': 'Luna'
    };

    // Express Setup
    const router = express.Router();
    router.get('/health', (req, res) => res.status(200).json({ status: 'healthy', service: serviceName }));
    router.get('/api/profile/:chatId', verifyInternalToken, (req, res) => {
        const { chatId } = req.params;
        const profile = userProfiles.get(chatId) || { streakCount: 0, moodScore: 50 };
        const personaId = userPersonas.get(chatId) || 'anime_gojo';
        res.json({ ...profile, personaId, displayName: personaDisplayNames[personaId] });
    });

    if (sharedApp) {
        sharedApp.use(`/${serviceName}`, router);
        log('API', `${serviceName} Profile Sync mounted to /${serviceName}`);
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
                let personaId = 'anime_gojo';
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

            const personaId = userPersonas.get(chatId) || 'anime_gojo';
            
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
            safeSendMessage(msg.chat.id, "oops, something went wrong in the anime world.");
        }
    });


function detectLanguage(text) {
    if (!text) return 'english';
    const hindiChars = (text.match(/[\u0900-\u097F]/g) || []).length;
    if (hindiChars > 0) return 'hindi';
    return 'english';
}

    // WINGMAN PROTOCOL & COMMAND HANDLERS
    bot.onText(/\/wingman (.+)/, async (msg, match) => {
        const chatId = msg.chat.id;
        const play = match[1].toLowerCase();
        const personaId = userPersonas.get(chatId) || 'anime_gojo';
        log(`TG-${chatId}`, `Wingman Requested: ${play}`);

        let prompt = "";
        if (play.includes("hype")) {
            prompt = "We are in a group chat. The user is a legend. Say something high-energy and character-appropriate to hype them up. Make it look natural.";
        } else if (play.includes("save") || play.includes("rescue")) {
            prompt = "Create a believable 'fake emergency' or a reason for the user to leave the conversation immediately. Be convincing and in character.";
        } else {
            prompt = `Respond to the group in a way that makes the user look cool/funny. Context: ${play}`;
        }

        const response = await getCharacterResponse(personaId, prompt, false, chatId);
        saveToHistory(chatId, 'assistant', response);
        await safeSendMessage(chatId, response);
    });

    bot.onText(/\/interpret (.+)/, async (msg, match) => {
        const chatId = msg.chat.id;
        const dream = match[1];
        const personaId = userPersonas.get(chatId) || 'anime_gojo';
        log(`TG-${chatId}`, `Dream Interpretation Requested`);
        const prompt = `I just had a dream: "${dream}". As my companion, interpret this dream for me in your unique character style. Be mystical, psychological, or funny depending on who you are.`;
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
            const profile = userProfiles.get(chatId) || { facts: [], jokes: [], nicknames: [], events: [], lastLowDate: null };
            const personaId = userPersonas.get(chatId) || 'anime_gojo';

            // 1. EVENT FOLLOW-UP
            const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
            const eventToday = profile.events?.find(e => {
                const time = e.time.toLowerCase();
                return time.includes(today) || (time.includes("tomorrow") && (now - e.created) > (18 * 60 * 60 * 1000));
            });

            if (eventToday) {
                log(`TG-${chatId}`, `Triggering EVENT nudge`);
                await sendHumanizedResponse(chatId, `Oye, ${eventToday.type} ke liye ready? All the best! 🤞`, personaId);
                profile.events = profile.events.filter(e => e !== eventToday);
                userProfiles.set(chatId, profile);
                userActivity.set(chatId, now);
                continue;
            }

            // 2. STANDARD NUDGE
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
