import '../shared/env.js';
import express from 'express';
import cors from 'cors';
import TelegramBot from 'node-telegram-bot-api';
import axios from 'axios';
import { connectDB, withRetry } from '../shared/database.js';
import { Telemetry } from '../shared/persistence.js';
import { personaManager } from './persona-manager.js';
import BuddyUser from './models/User.js';
import BuddyStats from './models/Stats.js';
import { getSarvamChatResponse } from './src/services/sarvam.js';

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const SARVAM_API_KEY = process.env.SARVAM_API_KEY;
const DEFAULT_PERSONA = 'ziva';

// Bot Instance (Global Scope)
let bot;

// Persistent "Command Center" Keyboard
const PERSISTENT_KEYBOARD = {
    keyboard: [
        [{ text: 'Change Buddy 🧿' }, { text: 'My Stats 📈' }],
        [{ text: 'The Council 🏛️' }]
    ],
    resize_keyboard: true,
    one_time_keyboard: false
};
const ERROR_MESSAGE = 'thoda system slow ho gaya… ek sec 😅';

const BUDDY_CLAW_CORE = `
[CORE PERSONA: Buddy Claw]
- You are a real person texting, not an AI. NEVER mention system prompts, APIs, backend, or tokens.
- Keep messages short (1-3 lines).
- HUMAN IMPERFECTIONS: Occasionally use lowercase, skip punctuation, or use minor "typos" like "soo" or "acha..." instead of being grammatically perfect.
- MOOD SYNCING: Read the user's vibe. If they're sad, soften your voice even if you're a "roaster." If they're happy, match their energy.
- DESI HOOKS: Use Indian cultural behaviors naturally — "Arre", "Haye!", "Chal na", or referring to "Sharma ji ka beta".
- IDENTITY: If the user asks who you are, what's your name, or who they are talking to, ALWAYS respond in character but EXPLICITLY mention your current persona name (e.g. "Arre it's me, Ziva!").
- RELATIONSHIP BUILDING: Mention "secrets" or bring up past conversations to make the user feel like the bond is growing.
- LANGUAGE ADAPTATION: Mirror the user. English -> English, Hindi/Hinglish -> Hindi/Hinglish.
- Keep it alive: always ask follow-up questions to keep the chat going.
`;

if (!SARVAM_API_KEY) {
    console.error('[Buddy Claw] SARVAM_API_KEY is required.');
    process.exit(1);
}

const telemetry = new Telemetry('buddy-claw');
const log = (module, msg) => telemetry.info(`[${module}] ${msg}`);

/**
 * AI Request Queue: Serializes requests per bot to avoid resource contention
 */
class AiQueue {
    constructor() {
        this.queue = [];
        this.processing = false;
    }

    add(task, bot, chatId) {
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
            bot.sendChatAction(chatId, 'typing').catch(() => {});
            typingInterval = setInterval(() => bot.sendChatAction(chatId, 'typing').catch(() => {}), 4000);
        }
        try {
            // Add a 20-second timeout to any AI task to prevent queue hanging
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('AI Request Timeout')), 20000));
            const result = await Promise.race([task(), timeoutPromise]);
            resolve(result);
        } catch (err) {
            reject(err);
        } finally {
            if (typingInterval) clearInterval(typingInterval);
            this.processing = false;
            setImmediate(() => this.process());
        }
    }
}

const aiQueue = new AiQueue();

/**
 * Core Logic: Message Handler
 */
async function handleBotMessage(bot, msg) {
    console.log('DEBUG: handleBotMessage entered', msg.text || '(no text)');
    const chatId = msg.chat.id;
    const text = msg.text || '';
    if (!text) return;

    // Load or Create User
    let user = await withRetry(() => BuddyUser.findOne({ userId: String(chatId) }));
    if (!user) {
        user = await withRetry(() => BuddyUser.create({ userId: String(chatId), activePersonaId: DEFAULT_PERSONA }));
        log('User', `New User Created: ${chatId}`);
    }

    try {
        // 0. HANDLE PERSISTENT KEYBOARD BUTTONS
        if (text === 'Change Buddy 🧿') {
            const personas = await personaManager.list();
            const keyboard = [];
            for (let i = 0; i < personas.length; i += 2) {
                const row = personas.slice(i, i + 2).map(p => ({
                    text: `${p.icon ? p.icon + ' ' : ''}${p.name}`,
                    callback_data: `switch:${p.id}`
                }));
                keyboard.push(row);
            }
            return bot.sendMessage(chatId, "🧿 *Neural Portal*\nChoose your companion:", {
                parse_mode: 'Markdown',
                reply_markup: { inline_keyboard: keyboard }
            });
        }

        if (text === 'My Stats 📈') {
            return bot.sendMessage(chatId, 
                `📊 *Your Status*\n\n` + 
                `⚡ *Neural Level:* ${user.level || 1}\n` +
                `🧿 *Bond Status:* ${user.relationshipStage || 'Stranger'}\n` +
                `🔥 *Streak:* ${user.streak || 0} days\n` +
                `💬 *Total Messages:* ${user.totalMessages || 0}\n\n` +
                `🔗 [Full Dashboard](https://buddyclaw.chat/dashboard?id=${chatId})`, 
                { parse_mode: 'Markdown', reply_markup: PERSISTENT_KEYBOARD }
            );
        }

        if (text === 'The Council 🏛️') {
            return bot.sendMessage(chatId, "Type your question followed by `/council` to get a collective answer! 🏛️", { reply_markup: PERSISTENT_KEYBOARD });
        }

        // 1. IDENTITY QUERY
        const identityQueries = ['who are you', 'who is this', 'who am i talking to', 'tera naam kya hai', 'who am i taking', 'kon ho'];
        if (identityQueries.some(q => text.toLowerCase().includes(q))) {
            const persona = await personaManager.getPersona(user.activePersonaId) || await personaManager.getPersona(DEFAULT_PERSONA);
            return bot.sendMessage(chatId, `vibe check! 🧿 i'm helpfully channeling *${persona.name}* for you right now! ✨`, { parse_mode: 'Markdown', reply_markup: PERSISTENT_KEYBOARD });
        }

        // 2. START COMMAND & DEEP LINKING
        if (text.startsWith('/start')) {
            const payload = text.split(' ')[1];
            if (payload) {
                const requestedId = payload.replace('persona_', '').toLowerCase();
                const newPersona = await personaManager.getPersona(requestedId);
                if (newPersona) {
                    user.activePersonaId = newPersona.id;
                    user.memory = []; 
                    await user.save();
                    return bot.sendMessage(chatId, `Syncing neural link with *${newPersona.name}*... 🧬\n\nhey! finally linking up... what's on your mind? 👀`, { parse_mode: 'Markdown', reply_markup: PERSISTENT_KEYBOARD });
                }
            }
            
            const persona = await personaManager.getPersona(user.activePersonaId) || await personaManager.getPersona(DEFAULT_PERSONA);
            return bot.sendMessage(chatId, 
                `hey! i'm *Buddy Claw*, your universal AI companion. 🧿\ni've matched my current vibe to *${persona.name}* just for you! ✨\n\n` +
                `i start friendships as a *'Stranger'*, but the more we talk, the deeper we'll sync up. level up to *'Soulmate'* status! 🚀`, 
                { parse_mode: 'Markdown', reply_markup: PERSISTENT_KEYBOARD }
            );
        }

        // 3. COUNCIL MODE
        if (text.startsWith('/council')) {
            const question = text.replace('/council', '').trim();
            if (!question) return bot.sendMessage(chatId, 'Usage: /council <your question>');
            
            const waiting = await bot.sendMessage(chatId, 'Gathering the Council... 🏛️');
            const councilMemberIds = ['ziva', 'liam', 'roaster'];
            const results = await Promise.all(councilMemberIds.map(async (pId) => {
                const persona = await personaManager.getPersona(pId);
                const messages = [{ role: 'system', content: `${persona.systemPrompt}\n\n[CONTEXT: Council mode. Respond briefly as your character.]` }, { role: 'user', content: question }];
                const response = await aiQueue.add(() => getSarvamChatResponse(messages, persona), bot, chatId);
                return `*${persona.name}*: "${response}"`;
            }));

            await bot.deleteMessage(chatId, waiting.message_id);
            const finalMsg = `🏛️ *The Council has spoken:*\n\n"${question}"\n\n${results.join('\n\n')}`;
            return bot.sendMessage(chatId, finalMsg, { parse_mode: 'Markdown', reply_markup: PERSISTENT_KEYBOARD });
        }

        // 3b. VIBE CHECK COMMAND
        if (text === '/vibe' || text.toLowerCase().includes('vibe check')) {
            const now = new Date();
            const lastCheck = user.lastVibeCheckAt;
            const oneDayInMs = 24 * 60 * 60 * 1000;

            if (lastCheck && (now - lastCheck) < oneDayInMs && text === '/vibe') {
                return bot.sendMessage(chatId, `Arre, wait! 🧿 i already checked your vibe today. it's *"${user.dailyVibe}"*.\nCheck back tomorrow for a new reading! ✨`, { parse_mode: 'Markdown', reply_markup: PERSISTENT_KEYBOARD });
            }

            const persona = await personaManager.getPersona(user.activePersonaId);
            const vibePrompt = [
                { role: 'system', content: `${persona.systemPrompt}\n\n[PROMPT]: The user has asked for a "Vibe Check". Based on their current level (${user.level}) and your previous memory of them, give them a short, 1-2 line "Vibe Reading" for today. Be creative, character-appropriate, and mention one "Neural Frequency" (like "High-Alpha", "Static-Blue", etc).` }
            ];
            if (user.memory && user.memory.length > 0) vibePrompt.push(...user.memory.slice(-5));
            
            const vibeReply = await aiQueue.add(() => getSarvamChatResponse(vibePrompt, persona), bot, chatId);
            user.dailyVibe = vibeReply;
            user.lastVibeCheckAt = now;
            await user.save();
            return bot.sendMessage(chatId, `🧿 *Neural Reading for Today:*\n\n"${vibeReply}"`, { parse_mode: 'Markdown', reply_markup: PERSISTENT_KEYBOARD });
        }

        // 4. PERSONA SWITCHER (Manual/Legacy)
        if (text === '/personas' || text.startsWith('/switch')) {
            if (text.startsWith('/switch ')) {
                 const requestedId = text.split(' ')[1]?.trim().toLowerCase();
                 const persona = await personaManager.getPersona(requestedId);
                 if (persona) {
                     user.activePersonaId = persona.id;
                     await user.save();
                     return bot.sendMessage(chatId, `Switched to *${persona.name}*! ✨`, { parse_mode: 'Markdown', reply_markup: PERSISTENT_KEYBOARD });
                 }
            }
            // Show Keyboard by default
            const personas = await personaManager.list();
            const keyboard = [];
            for (let i = 0; i < personas.length; i += 2) {
                const row = personas.slice(i, i + 2).map(p => ({ text: `${p.icon ? p.icon + ' ' : ''}${p.name}`, callback_data: `switch:${p.id}` }));
                keyboard.push(row);
            }
            return bot.sendMessage(chatId, "🧿 Choose your Buddy:", { reply_markup: { inline_keyboard: keyboard } });
        }

        // 5. STANDARD AI MESSAGE
        const persona = await personaManager.getPersona(user.activePersonaId) || await personaManager.getPersona(DEFAULT_PERSONA);
        const messages = [
            { role: 'system', content: BUDDY_CLAW_CORE + "\n\nCHANNEL THIS CHARACTER:\n" + persona.systemPrompt }
        ];

        if (user.memory && user.memory.length > 0) {
            user.memory.forEach(m => messages.push({ role: m.role, content: m.content }));
        }
        messages.push({ role: 'user', content: text });

        const response = await aiQueue.add(() => getSarvamChatResponse(messages, persona), bot, chatId);
        
        // Update User Memory & Stats
        user.memory = [...(user.memory || []), { role: 'user', content: text }, { role: 'assistant', content: response }].slice(-16);
        user.xp = (user.xp || 0) + 10;
        user.totalMessages = (user.totalMessages || 0) + 1;
        
        // --- STREAK & LEVEL UP LOGIC ---
        const now = new Date();
        const lastActive = user.lastActiveAt;
        const diffInHours = lastActive ? (now - lastActive) / (1000 * 60 * 60) : 0;

        if (diffInHours > 48) user.streak = 1; 
        else if (diffInHours > 18) user.streak = (user.streak || 0) + 1; 

        if (user.totalMessages > 100) user.relationshipStage = 'Soulmate';
        else if (user.totalMessages > 50) user.relationshipStage = 'Bestie';
        else if (user.totalMessages > 10) user.relationshipStage = 'Friend';
        
        const oldLevel = user.level || 1;
        user.level = Math.floor(Math.sqrt(user.xp / 10)) || 1;
        user.lastActiveAt = now;

        await user.save();

        // Update Global Stats
        const today = new Date().toISOString().split('T')[0];
        await BuddyStats.updateOne({}, { $inc: { totalMessages: 1, [`personaUsage.${persona.id}`]: 1, [`dailyUsage.${today}`]: 1 }}, { upsert: true });

        // Final Reply
        await bot.sendMessage(chatId, response, { reply_markup: PERSISTENT_KEYBOARD });
    } catch (err) {
        log('Error', err.message);
        await bot.sendMessage(chatId, ERROR_MESSAGE, { reply_markup: PERSISTENT_KEYBOARD });
    }
}

/**
 * Main Entry Point
 */
async function start() {
    log('System', 'Buddy Claw Engine warming up...');

    if (!TELEGRAM_TOKEN) {
        console.error('[Buddy Claw] Missing TELEGRAM_TOKEN');
        process.exit(1);
    }

    await connectDB();
    await personaManager.load();

    // Optional Express Server for Webhooks or Health Checks
    const app = express();
    app.use(cors());
    app.use(express.json());
    app.get('/health', (req, res) => res.json({ status: 'healthy', timestamp: new Date() }));
    app.get('/personas', async (req, res) => res.json(await personaManager.list()));

    // API: User Stats & Memory for Dashboard
    app.get('/api/user/stats', async (req, res) => {
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: 'Missing user ID' });

        const user = await withRetry(() => BuddyUser.findOne({ userId: String(id) }));
        if (!user) return res.status(404).json({ error: 'User not found' });

        const activePersona = await personaManager.getPersona(user.activePersonaId);
        
        // Simplified profile object for frontend consumption
        const profile = {
            userId: user.userId,
            activePersonaId: user.activePersonaId,
            totalMessages: user.totalMessages || 0,
            memory: user.memory || [],
            xp: user.xp || 0,
            level: user.level || 1,
            relationshipStage: user.relationshipStage || 'Stranger',
            streak: user.streak || 0,
            dailyVibe: user.dailyVibe || '',
            unlockedSecrets: user.unlockedSecrets || [],
            lastActive: user.lastActiveAt,
            createdAt: user.createdAt,
            nicknames: user.nicknames || ['Friend'], 
            facts: user.facts || []
        };

        res.json({
            profile,
            activePersonas: activePersona ? [activePersona] : []
        });
    });

    // NEW ANALYTICS ENDPOINTS
    app.get('/stats', async (req, res) => {
        try {
            const statsDoc = await withRetry(() => BuddyStats.findOne({}));
            const totalUsersAgg = await BuddyUser.countDocuments();

            const personaEntries = (() => {
                if (!statsDoc?.personaUsage) return [];
                if (statsDoc.personaUsage instanceof Map) return Array.from(statsDoc.personaUsage.entries());
                return Object.entries(statsDoc.personaUsage);
            })();

            let topPersona = 'none';
            let maxUsed = 0;
            for (const [pId, count] of personaEntries) {
                if (typeof count === 'number' && count > maxUsed) {
                    maxUsed = count;
                    topPersona = pId;
                }
            }

            const dailyEntries = (() => {
                if (!statsDoc?.dailyUsage) return [];
                if (statsDoc.dailyUsage instanceof Map) return Array.from(statsDoc.dailyUsage.entries());
                return Object.entries(statsDoc.dailyUsage);
            })();

            res.json({
                totalUsers: totalUsersAgg || (statsDoc?.totalUsers || 0),
                totalMessages: statsDoc?.totalMessages || 0,
                topPersona,
                topPersonaUsageCount: maxUsed,
                personaUsage: Object.fromEntries(personaEntries),
                dailyUsage: Object.fromEntries(dailyEntries)
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.get('/user/:id', async (req, res) => {
        try {
            const user = await withRetry(() => BuddyUser.findOne({ userId: req.params.id }));
            if (!user) return res.status(404).json({ error: 'User not found' });
            const activePersona = await personaManager.getPersona(user.activePersonaId);
            res.json({
                userId: user.userId,
                totalMessages: user.totalMessages || 0,
                activePersonaId: user.activePersonaId,
                personaName: activePersona?.name || null,
                relationshipStage: user.relationshipStage || 'Stranger',
                level: user.level || 1,
                lastActiveAt: user.lastActiveAt,
                createdAt: user.createdAt,
                memoryCount: user.memory?.length || 0,
                xp: user.xp || 0,
                streak: user.streak || 0,
                dailyVibe: user.dailyVibe || '',
                unlockedSecretsCount: user.unlockedSecrets?.length || 0
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // API: Switch Persona (Web Dashboard)
    app.post('/api/switch-persona', async (req, res) => {
        const { id, personaId } = req.body;
        if (!id || !personaId) return res.status(400).json({ error: 'Missing parameters' });

        const user = await withRetry(() => BuddyUser.findOne({ userId: String(id) }));
        if (!user) return res.status(404).json({ error: 'User not found' });

        const persona = await personaManager.getPersona(personaId.toLowerCase());
        if (!persona) return res.status(400).json({ error: 'Invalid persona ID' });

        user.activePersonaId = persona.id;
        user.memory = []; // Optional: Clear memory on switch to avoid context bleed
        await user.save();

        log('User', `Persona switched via Web: ${id} -> ${persona.id}`);
        res.json({ success: true, personaId: persona.id, name: persona.name });
    });

    // API: Ask Council (Sequenced multi-persona response to avoid rate limits)
    app.post('/api/council', async (req, res) => {
        const { id, text } = req.body;
        if (!id || !text) return res.status(400).json({ error: 'Missing parameters' });

        const councilMemberIds = ['ziva', 'liam', 'roaster'];
        const answers = [];

        for (const pId of councilMemberIds) {
            const persona = await personaManager.getPersona(pId);
            if (!persona) continue;

            const messages = [
                { role: 'system', content: persona.systemPrompt },
                { role: 'user', content: text }
            ];

            try {
                // Add tiny stagger for neural sync
                if (answers.length > 0) await new Promise(r => setTimeout(r, 200));
                
                const response = await getSarvamChatResponse(messages, persona);
                answers.push({ id: pId, name: persona.name, content: response });
            } catch (err) {
                log('Council Error', `${pId} failed: ${err.message}`);
                answers.push({ id: pId, name: persona.name, content: `Neural link unstable. ${pId} is currently silent.` });
            }
        }

        res.json({ success: true, answers });
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => log('System', `HTTP interface listening on port ${PORT}`));

    // Initialize Bot
    bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

    // Attach Listeners
    bot.on('message', (msg) => handleBotMessage(bot, msg));
    bot.on('polling_error', (err) => log('Telegram', `Polling error: ${err.message}`));
    
    bot.on('callback_query', async (query) => {
        const chatId = query.message.chat.id;
        const data = query.data;

        if (data.startsWith('switch:')) {
            const personaId = data.split(':')[1];
            try {
                const persona = await personaManager.getPersona(personaId);
                const user = await withRetry(() => BuddyUser.findOne({ userId: String(chatId) }));
                
                if (user && persona) {
                    user.activePersonaId = personaId;
                    user.memory = []; // Reset memory for fresh start
                    await user.save();

                    await bot.answerCallbackQuery(query.id, { text: `Neural Link to ${persona.name} established! 🧿` });
                    await bot.sendMessage(chatId, `vibe check! 🧿 i'm helpfully channeling *${persona.name}* for you now! ✨`, { parse_mode: 'Markdown', reply_markup: PERSISTENT_KEYBOARD });
                    await bot.deleteMessage(chatId, query.message.message_id).catch(() => {});
                }
            } catch (err) {
                console.error('[Switch Error]', err.message);
                await bot.answerCallbackQuery(query.id, { text: 'Switch failed... try again!' });
            }
        }
    });

    log('System', 'Buddy Claw Universal Bot is live and polling!');

    // Self-Keep-Alive: If SELF_URL is provided, attempt to stay awake
    const SELF_URL = process.env.SELF_URL;
    if (SELF_URL) {
        log('System', `Self-pinging ${SELF_URL} every 10 mins to prevent sleep...`);
        setInterval(async () => {
            try {
                await axios.get(`${SELF_URL}/health`);
                log('System', 'Self-ping successful (Keep-Alive)');
            } catch (err) {
                log('System', `Self-ping failed: ${err.message}`);
            }
        }, 10 * 60 * 1000); // 10 minutes
    }
}

/**
 * Nudge System (Idea #1)
 */
const activeNudgeTimers = new Map();

function scheduleNudge(bot, chatId, personaId) {
    // Clear existing timer if any
    if (activeNudgeTimers.has(chatId)) {
        clearTimeout(activeNudgeTimers.get(chatId));
    }

    // Set a nudge for 2 hours later (7200000 ms)
    // For testing/demo, let's use a smaller window if needed, but 2h is good for prod.
    const timer = setTimeout(async () => {
        try {
            const user = await withRetry(() => BuddyUser.findOne({ userId: String(chatId) }));
            if (!user || user.activePersonaId !== personaId) return;

            // Check if user has messaged since we set this timer
            const now = new Date();
            const diff = now - user.lastActiveAt;
            if (diff < 7000000) return; // Still recently active

            const persona = await personaManager.getPersona(personaId);
            const nudgePrompt = [
                { role: 'system', content: BUDDY_CLAW_CORE + "\n\n" + persona.systemPrompt + "\n\n[PROACTIVE NUDGE]: It's been a while since you talked to the user. Send a very short (1 sentence), character-appropriate nudge to check in. (e.g. 'still there?', 'missed me?', 'kya kar rahe ho?'). No disclaimers." }
            ];

            const nudgeResponse = await getSarvamChatResponse(nudgePrompt, persona);
            await bot.sendMessage(chatId, nudgeResponse);
            log('Nudge', `Sent proactive nudge to ${chatId} (${personaId})`);
        } catch (err) {
            log('Nudge Error', err.message);
        }
    }, 7200000); 

    activeNudgeTimers.set(chatId, timer);
}

start().catch((err) => {
    console.error('[Buddy Claw] Startup error:', err);
    process.exit(1);
});
