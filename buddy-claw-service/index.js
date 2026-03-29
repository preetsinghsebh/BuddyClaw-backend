import '../shared/env.js';
import express from 'express';
import cors from 'cors';
import TelegramBot from 'node-telegram-bot-api';
import { connectDB } from '../shared/database.js';
import { Telemetry } from '../shared/persistence.js';
import { personaManager } from './persona-manager.js';
import BuddyUser from './models/User.js';
import { getSarvamChatResponse } from './src/services/sarvam.js';

const TELEGRAM_TOKEN = process.env.BUDDY_CLAW_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
const SARVAM_API_KEY = process.env.SARVAM_API_KEY;
const DEFAULT_PERSONA = 'ziva';
const ERROR_MESSAGE = 'thoda system slow ho gaya… ek sec 😅';

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
    const chatId = msg.chat?.id;
    const text = (msg.text || msg.caption || '').trim();
    if (!chatId || !text) return;

    // 1. Identify User (Create if not exists)
    let user = await BuddyUser.findOne({ userId: String(chatId) });
    if (!user) {
        user = new BuddyUser({ userId: String(chatId), activePersonaId: DEFAULT_PERSONA });
        await user.save();
        log('User', `New user registered: ${chatId}`);
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

    // START command
    if (text.startsWith('/start')) {
        const persona = await personaManager.getPersona(user.activePersonaId) || await personaManager.getPersona(DEFAULT_PERSONA);
        await bot.sendMessage(chatId, `Hey! I'm *Buddy Claw*, your universal AI companion. Currently, I'm channeling *${persona.name}* for you. ✨`, { parse_mode: 'Markdown' });
        return;
    }

    // 3. Setup AI Request
    const persona = await personaManager.getPersona(user.activePersonaId) || await personaManager.getPersona(DEFAULT_PERSONA);
    const messages = [
        { role: 'system', content: persona.systemPrompt }
    ];

    // Inject conversation memory (last 12 messages) for context
    if (user.memory && user.memory.length > 0) {
        user.memory.forEach(m => messages.push({ role: m.role, content: m.content }));
    }
    
    // Add current user message
    messages.push({ role: 'user', content: text });

    // 4. Send request via Queue
    try {
        log('AI', `Processing request for user ${chatId} using persona ${persona.id}`);
        const response = await aiQueue.add(() => getSarvamChatResponse(messages, persona), bot, chatId);
        
        // 5. Update State with rolling memory (limit to 12 entries)
        const userMsg = { role: 'user', content: text };
        const assistantMsg = { role: 'assistant', content: response };
        
        user.memory = [...(user.memory || []), userMsg, assistantMsg].slice(-12);
        user.xp = (user.xp || 0) + 10; // Earn 10 XP per message exchange
        user.lastActive = new Date();
        await user.save();

        // 6. Return response to user
        await bot.sendMessage(chatId, response);
    } catch (err) {
        log('Error', `Chat ${chatId} failed: ${err.message}`);
        console.error(err);
        await bot.sendMessage(chatId, ERROR_MESSAGE);
    }
}

/**
 * Main Entry Point
 */
async function start() {
    log('System', 'Buddy Claw Engine warming up...');

    if (!TELEGRAM_TOKEN) {
        console.error('[Buddy Claw] Missing Telegram token (BUDDY_CLAW_TOKEN or TELEGRAM_BOT_TOKEN)');
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

        const user = await BuddyUser.findOne({ userId: String(id) });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const activePersona = await personaManager.getPersona(user.activePersonaId);
        
        // Simplified profile object for frontend consumption
        const profile = {
            userId: user.userId,
            activePersonaId: user.activePersonaId,
            memory: user.memory || [],
            xp: user.xp || 0,
            level: Math.floor(Math.sqrt((user.xp || 0) / 10)),
            lastActive: user.lastActive,
            // Fallback stats for UI consistency
            nicknames: ['Friend'], 
            facts: [],
            streakCount: 1, 
            moodScore: 75,
            lastChatDate: user.lastActive?.toISOString().split('T')[0]
        };

        res.json({
            profile,
            activePersonas: activePersona ? [activePersona] : []
        });
    });

    // API: Switch Persona (Web Dashboard)
    app.post('/api/switch-persona', async (req, res) => {
        const { id, personaId } = req.body;
        if (!id || !personaId) return res.status(400).json({ error: 'Missing parameters' });

        const user = await BuddyUser.findOne({ userId: String(id) });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const persona = await personaManager.getPersona(personaId.toLowerCase());
        if (!persona) return res.status(400).json({ error: 'Invalid persona ID' });

        user.activePersonaId = persona.id;
        user.memory = []; // Optional: Clear memory on switch to avoid context bleed
        await user.save();

        log('User', `Persona switched via Web: ${id} -> ${persona.id}`);
        res.json({ success: true, personaId: persona.id, name: persona.name });
    });

    // API: Ask Council (Parallel multi-persona response)
    app.post('/api/council', async (req, res) => {
        const { id, text } = req.body;
        if (!id || !text) return res.status(400).json({ error: 'Missing parameters' });

        const councilMemberIds = ['ziva', 'liam', 'roaster'];
        const results = await Promise.all(councilMemberIds.map(async (pId) => {
            const persona = await personaManager.getPersona(pId);
            if (!persona) return null;
            const messages = [
                { role: 'system', content: persona.systemPrompt },
                { role: 'user', content: text }
            ];
            try {
                const response = await getSarvamChatResponse(messages, persona);
                return { id: pId, name: persona.name, content: response };
            } catch (err) {
                return { id: pId, name: persona.name, content: "Neural link timeout..." };
            }
        }));

        res.json({ question: text, answers: results.filter(r => r !== null) });
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => log('System', `HTTP interface listening on port ${PORT}`));

    // Bot implementation (Polling for simple local tests, Webhook for production)
    const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: process.env.USE_WEBHOOK !== 'true' });
    bot.on('message', (msg) => handleBotMessage(bot, msg));
    bot.on('polling_error', (err) => log('Telegram', `Polling error: ${err.message}`));

    log('System', 'Buddy Claw is live and universal!');
}

start().catch((err) => {
    console.error('[Buddy Claw] Startup error:', err);
    process.exit(1);
});
