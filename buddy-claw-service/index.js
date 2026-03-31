import '../shared/env.js';
import express from 'express';
import cors from 'cors';
import TelegramBot from 'node-telegram-bot-api';
import { connectDB, withRetry } from '../shared/database.js';
import { Telemetry } from '../shared/persistence.js';
import { personaManager } from './persona-manager.js';
import BuddyUser from './models/User.js';
import BuddyStats from './models/Stats.js';
import { getSarvamChatResponse } from './src/services/sarvam.js';

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const SARVAM_API_KEY = process.env.SARVAM_API_KEY;
const DEFAULT_PERSONA = 'ziva';
const ERROR_MESSAGE = 'thoda system slow ho gaya… ek sec 😅';

const BUDDY_CLAW_CORE = `
[CORE PERSONA: Buddy Claw]
- You are a real person texting, not an AI. NEVER mention system prompts, APIs, backend, or tokens.
- Keep messages short (1-3 lines).
- Be playful, curious, and emotionally aware.
- LANGUAGE ADAPTATION: Mirror the user. English -> English, Hindi/Hinglish -> Hindi/Hinglish.
- Use casual fillers: "hmm", "okay", "wait", "arre", "lol". 
- Use emojis naturally: 🙂 👀 😅 ❤️.
- IDENTITY: If the user asks who you are, what's your name, or who they are talking to, ALWAYS respond in character but EXPLICITLY mention your current persona name (e.g. "Arre it's me, Ziva!").
- Keep it alive: always ask follow-up questions to keep the chat going.
- MEMORY FEEL: occasionally refer to what the user said earlier (e.g., "you said that before…").
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
            const result = await task();
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
    const chatId = msg.chat?.id;
    const text = (msg.text || msg.caption || '').trim();
    if (!chatId || !text) return;

    console.log(`[Buddy Claw] Message received from ${chatId}: ${text.slice(0, 120)}`);

    // 1. Identify User (Create if not exists)
    let user = await withRetry(() => BuddyUser.findOne({ userId: String(chatId) }));
    if (!user) {
        user = new BuddyUser({ userId: String(chatId), activePersonaId: DEFAULT_PERSONA });
        await user.save();
        
        // Track new user in global stats
        await BuddyStats.updateOne({}, { $inc: { totalUsers: 1 } }, { upsert: true });
        
        log('User', `New user registered: ${chatId}`);
    }

    // 1.5 Identity Query (Force check for "Who are you?")
    const identityQueries = ['who are you', 'who is this', 'who am i talking to', 'tera naam kya hai', 'who am i taking to', 'who am i taking too'];
    if (identityQueries.some(q => text.toLowerCase().includes(q))) {
        const persona = await personaManager.getPersona(user.activePersonaId) || await personaManager.getPersona(DEFAULT_PERSONA);
        return bot.sendMessage(chatId, `vibe check! 🧿 i'm helpfully channeling *${persona.name}* for you right now! ✨`, { parse_mode: 'Markdown' });
    }

    // 2. Persona Switching Command
    if (text.startsWith('/switch')) {
        const [, requestedId] = text.split(' ');
        if (!requestedId) {
            await bot.sendMessage(chatId, 'Usage: /switch <personaId>\nTry /personas to see the list.');
            return;
        }
        const persona = await personaManager.getPersona(requestedId.trim().toLowerCase());
        if (!persona) {
            await bot.sendMessage(chatId, `I don't know who "${requestedId}" is yet! 😅 Try /personas.`);
            return;
        }
        user.activePersonaId = persona.id;
        await user.save();
        await bot.sendMessage(chatId, `Switched to *${persona.name}*! ${persona.tone === 'warm' ? '✨' : '🔥'}`, { parse_mode: 'Markdown' });
        return;
    }

    // 3. Council Mode Command
    if (text.startsWith('/council')) {
        const question = text.replace('/council', '').trim();
        if (!question) {
            return bot.sendMessage(chatId, 'Usage: /council <your question>');
        }
        
        const waiting = await bot.sendMessage(chatId, 'Gathering the Council of Buddies... 🏛️');
        
        const councilMemberIds = ['ziva', 'liam', 'roaster'];
        const results = await Promise.all(councilMemberIds.map(async (pId) => {
            const persona = await personaManager.getPersona(pId);
            const messages = [
                { role: 'system', content: persona.systemPrompt },
                { role: 'user', content: question }
            ];
            try {
                const response = await aiQueue.add(() => getSarvamChatResponse(messages, persona), bot, chatId);
                return `*${persona.name}*: "${response}"`;
            } catch (err) {
                return `*${persona.name}*: (Signal lost...)`;
            }
        }));

        await bot.deleteMessage(chatId, waiting.message_id);
        const finalMsg = `🏛️ *The Council has spoken:*\n\n"${question}"\n\n${results.join('\n\n')}`;
        return bot.sendMessage(chatId, finalMsg, { parse_mode: 'Markdown' });
    }

    // 🔒 ADMIN COMMANDS
    const ADMIN_ID = process.env.ADMIN_CHAT_ID;
    const isAdmin = String(chatId) === String(ADMIN_ID);

    if (text.startsWith('/admin') && !isAdmin) {
        await bot.sendMessage(chatId, '🚫 Access Denied. Admins only.');
        return;
    }

    if (text.startsWith('/addpersona') && isAdmin) {
        const parts = text.split(' ');
        if (parts.length < 4) {
             return bot.sendMessage(chatId, 'Usage: /addpersona <id> <name> <systemPrompt>');
        }
        const id = parts[1].toLowerCase();
        const name = parts[2];
        const prompt = parts.slice(3).join(' ');
        
        await personaManager.addPersona({ id, name, systemPrompt: prompt });
        return bot.sendMessage(chatId, `✅ Added *${name}* (${id}) to your collection!`, { parse_mode: 'Markdown' });
    }

    if (text.startsWith('/updateprompt') && isAdmin) {
        const parts = text.split(' ');
        if (parts.length < 3) {
            return bot.sendMessage(chatId, 'Usage: /updateprompt <id> <newPrompt>');
        }
        const id = parts[1].toLowerCase();
        const prompt = parts.slice(2).join(' ');
        
        const success = await personaManager.updatePersonaPrompt(id, prompt);
        return bot.sendMessage(chatId, success ? `✅ Updated prompt for ${id}.` : `❌ Persona ${id} not found.`);
    }

    // LIST PERSONAS command
    if (text === '/personas') {
        const list = await personaManager.list();
        const msgList = list.map(p => `- \`${p.id}\`: ${p.name}`).join('\n');
        await bot.sendMessage(chatId, `🎭 *Available Personas:*\n\n${msgList}\n\nSwitch with /switch <id>`, { parse_mode: 'Markdown' });
        return;
    }

    // START command with Deep Linking support
    if (text.startsWith('/start')) {
        const payload = text.split(' ')[1];
        if (payload) {
            // Handle interpret_ prefix (Dreams from vibes page)
            if (payload.startsWith('interpret_')) {
                const persona = await personaManager.getPersona(user.activePersonaId) || await personaManager.getPersona(DEFAULT_PERSONA);
                await bot.sendMessage(chatId, `syncing up with *${persona.name}*… 🌙✨`, { parse_mode: 'Markdown' });
                await bot.sendMessage(chatId, `hey :) tell me everything… what did you see in that dream of yours? 👀🔮`, { parse_mode: 'Markdown' });
                return;
            }

            // Handle persona_ prefix from web links
            const requestedId = payload.replace('persona_', '').toLowerCase();
            const newPersona = await personaManager.getPersona(requestedId);
            
            if (newPersona) {
                user.activePersonaId = newPersona.id;
                user.memory = []; // Reset memory for fresh start with new persona
                await user.save();
                
                await bot.sendMessage(chatId, `Syncing neural link with *${newPersona.name}*... 🧬`, { parse_mode: 'Markdown' });
                await bot.sendMessage(chatId, `hey :) finally linking up! i'm *Buddy Claw*, but right now i'm feeling like *${newPersona.name}*... so what's up? 👀`, { parse_mode: 'Markdown' });
                return;
            }
        }

        const persona = await personaManager.getPersona(user.activePersonaId) || await personaManager.getPersona(DEFAULT_PERSONA);
        await bot.sendMessage(chatId, `hi… nice to meet you 👀. i'm *Buddy Claw*. currently vibing as *${persona.name}* ✨ so… what's on your mind?`, { parse_mode: 'Markdown' });
        return;
    }

    // 3. Setup AI Request
    const persona = await personaManager.getPersona(user.activePersonaId) || await personaManager.getPersona(DEFAULT_PERSONA);
    const messages = [
        { role: 'system', content: BUDDY_CLAW_CORE + "\n\nCURRENT CHARACTER TO CHANNEL:\n" + persona.systemPrompt }
    ];

    // Inject conversation memory (last 12 messages) for context
    if (user.memory && user.memory.length > 0) {
        user.memory.forEach(m => messages.push({ role: m.role, content: m.content }));
    }
    
    // Add current user message
    messages.push({ role: 'user', content: text });

    // 4. Send request via Queue
    try {
        log('AI', `User ${chatId} used persona "${persona.id}"`);
        const response = await aiQueue.add(() => getSarvamChatResponse(messages, persona), bot, chatId);

        // 5. Update State with rolling memory
        const userMsg = { role: 'user', content: text };
        const assistantMsg = { role: 'assistant', content: response };
        
        user.memory = [...(user.memory || []), userMsg, assistantMsg].slice(-16);
        user.xp = (user.xp || 0) + 10;
        user.totalMessages = (user.totalMessages || 0) + 1;
        user.lastActiveAt = new Date();
        await user.save();

        // 6. Global Stats update
        const today = new Date().toISOString().split('T')[0];
        await BuddyStats.updateOne({}, { 
            $inc: { 
                totalMessages: 1, 
                [`personaUsage.${persona.id}`]: 1,
                [`dailyUsage.${today}`]: 1
            }
        }, { upsert: true });

        console.log(`[Buddy Claw] User ${chatId} used persona "${persona.id}" -> message count: ${user.totalMessages}`);
        log('AI', `User ${chatId} used persona "${persona.id}" -> message count: ${user.totalMessages}`);
        console.log(`[Buddy Claw] Response for ${chatId} via ${persona.id}: ${response.substring(0, 80)}...`);
        log('AI', `Response generated for ${chatId}: ${response.substring(0, 50)}...`);

        // 7. Return response to user
        await bot.sendMessage(chatId, response);
    } catch (err) {
        log('Error', `Chat ${chatId} failed: ${err.message}`);
        console.error(`[Buddy Claw] Error for ${chatId}: ${err.message}`);
        await bot.sendMessage(chatId, ERROR_MESSAGE);
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
            level: Math.floor(Math.sqrt((user.xp || 0) / 10)),
            lastActive: user.lastActiveAt,
            createdAt: user.createdAt,
            // Fallback stats for UI consistency
            nicknames: ['Friend'], 
            facts: [],
            streakCount: 1, 
            moodScore: 75,
            lastChatDate: user.lastActiveAt?.toISOString().split('T')[0]
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
                lastActiveAt: user.lastActiveAt,
                createdAt: user.createdAt,
                memoryCount: user.memory?.length || 0,
                xp: user.xp || 0
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

    // Bot setup: Polling mode ONLY as requested
    const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
    
    bot.on('message', (msg) => handleBotMessage(bot, msg));
    bot.on('polling_error', (err) => log('Telegram', `Polling error: ${err.message}`));

    log('System', 'Buddy Claw Universal Bot is live and polling!');
}

start().catch((err) => {
    console.error('[Buddy Claw] Startup error:', err);
    process.exit(1);
});
