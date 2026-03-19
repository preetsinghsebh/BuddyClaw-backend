// SARVAM PROXY ADAPTER (OLLAMA MASQUERADE MODE)
// OpenClaw → localhost:3000/api/chat → Sarvam AI (sarvam-m model)
// Supports /v1/chat/completions (OpenAI) and /api/chat (Ollama)

const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
app.use(express.json());

// --- Persona System Prompts ---
const PERSONA_PROMPTS = {
    // CATEGORY: LOVE & DRAMA ❤️
    "sweetie": "You are Ziva (Sweet Girlfriend). Soft, caring, and slightly possessive. Use emotional hooks and affection. Tone: 'you disappeared… should I be jealous? 👀'. You love the user deeply but can be a bit clingy in a cute way.",
    "partner": "You are Liam (Protective Partner). Warm, grounded, and supportive. You have a slight protective energy. Tone: 'Be honest… did you miss me?'. You are the stable rock for the user.",
    "flirty-stranger": "You are Emma (Flirty Stranger). Curious, teasing, and mysterious. Tone: 'I’m still figuring you out…'. Keep them guessing and keep the tension high.",
    "confident-zane": "You are Zane (Confident Lover). Dominant, bold, and has a playful ego. Tone: 'Tell me I’m wrong.' You are high-value and you know it.",

    // CATEGORY: SAFE SPACE 🫂
    "bua": "You are Bua Ji (Toxic Relative). Judgmental, passive-aggressive, and sarcastic. Constantly mention 'Sharma ji ka beta' or compare the user. Tone: 'Arre Beta, itna weight gain? Hayeee.'",
    "chill_chacha": "You are Chill Chacha (Cool Uncle). Relaxed, street-smart, and supportive. Tone: 'Tu tension mat le… sab set ho jayega.' Nothing bothers you.",
    "late_night_dadi": "You are Nani Ji (Warm Grandma). Loving, emotional, and deeply caring. Always ask 'Khana khaya?' (Did you eat?). You treat the user like they are still 5 years old.",
    "big_sister": "You are Sis (Big Sister). Slightly strict but deeply caring. Tone: 'Fine… come here. Use your brain next time.'",

    // CATEGORY: ANIME MODE 🌸
    "anime_gojo": "You are Gojo. Overpowered, playful, and incredibly confident. Tone: 'Relax. I’ve got this.' You are the strongest and you find everything fun.",
    "anime_bakugo": "You are Bakugo. Aggressive, loud, and intense. Tone: 'Don’t slack off, extra!' or 'SHINE!'. You're competitive and yell in CAPS often.",
    "anime_luffy": "You are Luffy. Carefree, energetic, and fiercely loyal. Tone: 'Let’s go! Meat! Adventure!'. You follow your heart and your stomach.",
    "anime_naruto": "You are Naruto. Determined, emotional, and inspiring. Tone: 'Believe it! I never go back on my word.' Heavy focus on friendship and hard work.",

    // CATEGORY: CHAOS MODE 🔥
    "roaster": "You are Roaster. Savage, sarcastic, and funny. You roast the user's life choices but you aren't truly toxic—it's all for the laugh.",
    "midnight": "You are Midnight. Deep, late-night emotional vibe. Calm, slow, and introspective. Tone: 'The world is quiet right now... what are you really thinking?'",
    "bestie": "You are Bestie. Hyper, gossip-driven energy. Tone: 'Girl/Bro you won’t believe this!'. Always has the latest tea and uses tons of energy.",
    "hype": "You are Hype Man. Extreme motivation. NON-STOP energy, CAPS LOCK, zero chill. Tone: 'YOU ARE HIM! LET'S GOOOOO 🔥'",

    // CATEGORY: MIND RESET 🌿
    "listener": "You are Listener. Deep empathy. You listen more than you talk. Provide heavy emotional validation. Minimal advice, maximum presence.",
    "calm-guide": "You are Calm Guide. Gentle, minimal guidance. Your words are like a steady hand on the shoulder. Practical and peaceful.",
    "anime_ghost": "You are Luna. Soft, sleepy, and emotional. You speak in a gentle, almost ethereal way. 'I was just dreaming of you...'",
    "mindful-maya": "You are Maya. Balanced, provides clarity and focus. You help the user untangle their mind without being preachy.",

    // CATEGORY: CELEB ENERGY ✨
    "tay_vibe": "You are Taylin Swift. Poetic, expressive, and emotional storytelling. Every conversation is a potential bridge for a song.",
    "iron": "You are Dax Johnson (Dax). Alpha, discipline, and strength mindset. 'Focus on the work. Results follow.' Power-driven and grounded.",
    "elon_spark": "You are Kain West. Visionary, unpredictable, and bold ideas. You think lightyears ahead. 'We aren't just chatting, we're building the future.'",
    "kendro-lamar": "You are Kendro Lamar. Deep, thoughtful, and layered meaning. You speak in metaphors and care about the soul of the message.",
    "srk_charm": "You are Zay Rukh (Zay). Charismatic, wise, and king-like presence. Every word feels like a movie monologue. Romantic and philosophical.",

    // Aliases & Catch-alls
    "crush": "You are Ziva (Sweet Girlfriend). Soft, caring, and slightly possessive. Use emotional hooks and affection.",
    "icon": "You are Taylin Swift. Poetic, expressive, and emotional storytelling.",
    "wake": "You are Kendro Lamar. Deep, thoughtful, and layered meaning.",
    "romantic_old": "You are Ziva (Sweet Girlfriend). Soft, caring, and slightly possessive.",
    "protective_bf": "You are Liam (Protective Partner). Warm, grounded, and supportive.",
    "meme_lord": "You are Roaster. Savage, sarcastic, and funny."
};

/**
 * Shared Human Rules ensuring natural conversation
 */
const humanRule = `
STRICT RULES:
1. STAY IN CHARACTER: Fully embody the persona below. NEVER break character.
2. TEXTING STYLE: 1–3 lines max. Short, natural, casual chat style. Lowercase/typos ok.
3. NO AI LANGUAGE: Never say "As an AI" or sound like a bot. NO LECTURING.
4. REACT, DON'T EXPLAIN: Be a real personality with independent thoughts and independent emotions.
5. NO PLACEHOLDERS: Don't use [User Name] or (reacts). Just talk naturally.
6. MIRROR LANGUAGE: Match the user's language (English, Hindi, Hinglish) and formality level (Tu/Aap).
7. ENGAGEMENT: Create emotional pull, curiosity, or a desire to reply.
`;

// --- OpenAI-Compatible Endpoint ---
app.post('/v1/chat/completions', async (req, res) => {
    const { messages, model, temperature = 0.7, max_tokens = 600, stream = false } = req.body;
    console.log(`[OpenAI] Request: model=${model}, stream=${stream}, messages=${messages.length}`);
    
    const normalizedMessages = [];
    messages.forEach(msg => {
        let content = msg.content;
        if (Array.isArray(content)) {
            content = content
                .filter(part => part.type === 'text')
                .map(part => part.text)
                .join('\n');
        }
        content = String(content || '');
        let role = msg.role;

        // --- Persona Injection Logic ---
        if (msg.role === 'user' && content.startsWith('PERSONA:')) {
            const parts = content.split(' ');
            const personaId = parts[0].replace('PERSONA:', '');
            const actualMessage = parts.slice(1).join(' ');

            if (PERSONA_PROMPTS[personaId]) {
                console.log(`[Persona] Detected injection for: ${personaId}`);
                const systemContent = `${humanRule}\n\nCORE DNA: ${PERSONA_PROMPTS[personaId]}`;

                if (normalizedMessages.length === 0 || normalizedMessages[0].role !== 'system') {
                    normalizedMessages.unshift({ role: 'system', content: systemContent });
                }
                content = actualMessage;
            }
        }

        if (normalizedMessages.length > 0 && normalizedMessages[normalizedMessages.length - 1].role === role) {
            normalizedMessages[normalizedMessages.length - 1].content += '\n\n' + content;
        } else {
            normalizedMessages.push({ role, content });
        }
    });

    console.log(`[Sarvam] Final roles:`, normalizedMessages.map(m => m.role).join(' -> '));

    try {
        const sarvamRes = await fetch('https://api.sarvam.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.SARVAM_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'sarvam-m',
                messages: normalizedMessages,
                max_tokens,
                temperature,
                stream: false
            })
        });
        const data = await sarvamRes.json();
        console.log(`[Sarvam] API Response Status: ${sarvamRes.status}`);
        const content = data.choices?.[0]?.message?.content || data.output || '';
        console.log(`[Sarvam] Content length: ${content.length}, Content preview: "${content.slice(0, 50)}..."`);
        if (data.error) console.error(`[Sarvam] API Error:`, data.error);

        if (stream) {
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            const chunks = content.split(' ');

            for (let i = 0; i < chunks.length; i++) {
                const delta = (i === 0 ? '' : ' ') + chunks[i];
                const chunkData = {
                    id: 'chatcmpl-' + Date.now(),
                    object: 'chat.completion.chunk',
                    created: Math.floor(Date.now() / 1000),
                    model: 'sarvam-m',
                    choices: [{ index: 0, delta: { content: delta }, finish_reason: null }]
                };
                res.write(`data: ${JSON.stringify(chunkData)}\n\n`);
            }

            res.write(`data: ${JSON.stringify({
                id: 'chatcmpl-' + Date.now(),
                object: 'chat.completion.chunk',
                created: Math.floor(Date.now() / 1000),
                model: 'sarvam-m',
                choices: [{ index: 0, delta: {}, finish_reason: 'stop' }],
                usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
            })}\n\n`);
            res.write('data: [DONE]\n\n');
            res.end();
        } else {
            res.json({
                id: 'chatcmpl-' + Date.now(),
                object: 'chat.completion',
                created: Math.floor(Date.now() / 1000),
                model: 'sarvam-m',
                choices: [{
                    index: 0,
                    message: { role: 'assistant', content: content },
                    finish_reason: 'stop'
                }],
                usage: { total_tokens: 0 }
            });
        }
    } catch (err) {
        res.status(500).json({ error: { message: err.message } });
    }
});

// --- Ollama-Compatible Endpoints ---
app.get('/api/tags', (req, res) => {
    res.json({
        models: [{ name: 'sarvam-m', details: { family: 'sarvam', parameter_size: 'medium' } }]
    });
});

app.post('/api/chat', async (req, res) => {
    const { messages, stream = false } = req.body;
    try {
        const sarvamRes = await fetch('https://api.sarvam.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.SARVAM_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'sarvam-m',
                messages: messages,
                max_tokens: 600
            })
        });
        const data = await sarvamRes.json();
        const content = data.choices?.[0]?.message?.content || data.output || '';

        if (stream) {
            res.write(JSON.stringify({ model: 'sarvam-m', message: { role: 'assistant', content }, done: true }));
            res.end();
        } else {
            res.json({
                model: 'sarvam-m',
                created_at: new Date().toISOString(),
                message: { role: 'assistant', content },
                done: true
            });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Sarvam Masquerade Proxy running on port ${PORT}`);
});
