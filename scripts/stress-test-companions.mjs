/**
 * DostAI Companion Stress Test
 * Tests all 25 companions with 5 messages each.
 * Message flow: English greeting → casual English → ask question → switch to Hindi → Hinglish
 * Validates: response received, no empty response, language mirroring
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

const PROXY_URL = process.env.SARVAM_PROXY_URL || 'https://api.sarvam.ai/v1/chat/completions';
const SARVAM_API_KEY = process.env.SARVAM_API_KEY;

// All 25 companions with their internal persona ID
const COMPANIONS = [
    // Love & Drama
    { id: 'sweet_gf',       name: 'Ziva (GF)',        service: 'ziva' },
    { id: 'protective_bf',  name: 'Liam (BF)',         service: 'liam' },
    { id: 'sweetie',        name: 'Emma (Stranger)',   service: 'ziva' },
    { id: 'partner',        name: 'Zane (Confident)',  service: 'liam' },
    // Safe Space
    { id: 'warm_grandma',   name: 'Dadi',              service: 'openclaw' },
    { id: 'jealous_bua',    name: 'Bua Ji',            service: 'openclaw' },
    { id: 'chill_chacha',   name: 'Chacha',            service: 'openclaw' },
    { id: 'big_sister',     name: 'Sis',               service: 'openclaw' },
    // Mind Reset
    { id: 'listener',       name: 'Listener',          service: 'safespace' },
    { id: 'guide',          name: 'Calm Guide',        service: 'safespace' },
    { id: 'sleep-luna',     name: 'Luna (Sleep)',      service: 'safespace' },
    { id: 'mindful-maya',   name: 'Maya (Focus)',      service: 'safespace' },
    // Chaos Mode
    { id: 'meme_lord',      name: 'Roaster',           service: 'openclaw' },
    { id: 'midnight',       name: 'Midnight',          service: 'openclaw' },
    { id: 'best_friend',    name: 'Bestie',            service: 'openclaw' },
    { id: 'hype_man',       name: 'Hype Man',          service: 'openclaw' },
    // Anime
    { id: 'anime_gojo',     name: 'Satoru Gojo',       service: 'anime' },
    { id: 'anime_bakugo',   name: 'Katsuki Bakugo',    service: 'anime' },
    { id: 'anime_luffy',    name: 'Monkey D. Luffy',   service: 'anime' },
    { id: 'anime_levi',     name: 'Levi Ackerman',     service: 'anime' },
    { id: 'anime_naruto',   name: 'Naruto Uzumaki',    service: 'anime' },
    // Celeb
    { id: 'tay_vibe',       name: 'Taylin Swift',      service: 'celeb' },
    { id: 'iron',           name: 'Dax Johnson',       service: 'celeb' },
    { id: 'elon_spark',     name: 'Kain West',         service: 'celeb' },
    { id: 'srk_charm',      name: 'Zay Rukh (SRK)',    service: 'celeb' },
];

// 5-message test sequence per companion
// msg 1-2: English   msg 3: English question   msg 4-5: Hindi (bot should switch)
const MESSAGES = [
    { text: 'Hey!', lang: 'english' },
    { text: 'How are you doing today?', lang: 'english' },
    { text: 'Tell me something interesting about yourself.', lang: 'english' },
    { text: 'Yaar kya chal raha hai life mein?', lang: 'hinglish' },
    { text: 'Acha acha, mujhe thoda aur batao apne baare mein!', lang: 'hinglish' },
];

async function callLLM(personaId, messages) {
    const systemPrompt = `PERSONA:${personaId}
You are a real human texting from your phone. Reply like a real person — casual, short, emotionally aware.
TEXTING RULES: 1–3 short sentences max. Casual tone. Max 1–2 emojis.
CONTINUITY: ALWAYS respond directly to the user's last message.
DO NOT act like an AI assistant. No 'How can I help you?'. No 'As an AI'.
LANGUAGE RULE (CRITICAL): Mirror the language of the user's LAST message. If they write English, reply in English. If they write Hindi/Hinglish, reply in Hindi/Hinglish. NEVER ignore this.`;

    const payload = {
        model: 'sarvam-m',
        messages: [
            { role: 'system', content: systemPrompt },
            ...messages
        ],
        temperature: 0.7,
        stream: false
    };

    const headers = { 'Content-Type': 'application/json' };
    if (SARVAM_API_KEY) {
        headers['Authorization'] = `Bearer ${SARVAM_API_KEY}`;
    }

    const res = await fetch(PROXY_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    }

    const data = await res.json();
    let content = data.choices?.[0]?.message?.content || '';
    // Strip thinking tags
    content = content.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/<\/?think>/gi, '').trim();
    return content;
}

function detectResponseLang(text) {
    if (!text) return 'empty';
    const hindiChars = (text.match(/[\u0900-\u097F]/g) || []).length;
    const total = text.replace(/\s/g, '').length;
    if (hindiChars > 0 && hindiChars / total > 0.3) return 'hindi';
    const hinglishWords = ['yaar', 'kya', 'hai', 'bhi', 'toh', 'na', 'acha', 'nahi', 'hoon', 'kar', 'tha', 'mein', 'aur', 'se', 'ke', 'ko', 'ho', 'raha', 'rahi', 'chal', 'bas'];
    const lower = text.toLowerCase();
    const words = lower.split(/[\s,!?.]+/);
    if (words.filter(w => hinglishWords.includes(w)).length >= 2) return 'hinglish';
    return 'english';
}

const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';

async function testCompanion(companion) {
    const results = [];
    const history = [];

    for (let i = 0; i < MESSAGES.length; i++) {
        const msg = MESSAGES[i];
        history.push({ role: 'user', content: msg.text });

        const start = Date.now();
        let response = '';
        let error = null;

        try {
            response = await callLLM(companion.id, history);
            if (!response) throw new Error('Empty response');
            history.push({ role: 'assistant', content: response });
        } catch (e) {
            error = e.message;
        }

        const elapsed = Date.now() - start;
        const responseLang = detectResponseLang(response);
        const expectedLang = i < 3 ? 'english' : 'hinglish';
        const langMatch = !error && (responseLang === expectedLang || responseLang === 'hindi' && expectedLang === 'hinglish');

        results.push({
            msgNum: i + 1,
            input: msg.text.slice(0, 35),
            response: response.slice(0, 50),
            responseLang,
            expectedLang,
            langMatch,
            elapsed,
            error
        });
    }

    return results;
}

async function main() {
    console.log(`\n${BOLD}${CYAN}╔══════════════════════════════════════════════════════╗${RESET}`);
    console.log(`${BOLD}${CYAN}║       DostAI Companion Stress Test — 25 Companions   ║${RESET}`);
    console.log(`${BOLD}${CYAN}║       5 Messages Each | Language Switch Test          ║${RESET}`);
    console.log(`${BOLD}${CYAN}╚══════════════════════════════════════════════════════╝${RESET}\n`);
    console.log(`${DIM}Proxy: ${PROXY_URL}${RESET}\n`);

    // Check proxy is reachable first
    if (PROXY_URL.includes('localhost')) {
        try {
            await fetch(PROXY_URL.replace('/v1/chat/completions', '/health'));
        } catch {
            console.log(`${YELLOW}⚠  Proxy health check failed — make sure sarvam-proxy is running:${RESET}`);
            console.log(`   cd sarvam-proxy && node adapter.js\n`);
        }
    }

    const summary = [];
    let totalPassed = 0;
    let totalFailed = 0;
    let totalLangMismatch = 0;

    for (const companion of COMPANIONS) {
        process.stdout.write(`${BOLD}Testing ${companion.name.padEnd(22)}${RESET} `);

        let passed = 0, failed = 0, langMismatch = 0;
        let results;

        try {
            results = await testCompanion(companion);

            for (const r of results) {
                if (r.error) {
                    failed++;
                    process.stdout.write(`${RED}✗${RESET}`);
                } else if (!r.langMatch) {
                    langMismatch++;
                    process.stdout.write(`${YELLOW}~${RESET}`);
                } else {
                    passed++;
                    process.stdout.write(`${GREEN}✓${RESET}`);
                }
            }
        } catch (e) {
            failed = 5;
            results = [];
            process.stdout.write(`${RED}✗✗✗✗✗${RESET}`);
        }

        totalPassed += passed;
        totalFailed += failed;
        totalLangMismatch += langMismatch;

        const status = failed > 0 ? `${RED}FAIL${RESET}` : langMismatch > 0 ? `${YELLOW}LANG${RESET}` : `${GREEN}PASS${RESET}`;
        console.log(`  [${status}] ${passed}/5 ok, ${failed} errors, ${langMismatch} lang mismatch`);

        // Print details for failed/lang-mismatch
        if ((failed > 0 || langMismatch > 0) && results.length > 0) {
            for (const r of results) {
                if (r.error || !r.langMatch) {
                    const icon = r.error ? '✗' : '~';
                    const col = r.error ? RED : YELLOW;
                    console.log(`  ${col}  [Msg ${r.msgNum}] ${icon} Input: "${r.input}"${RESET}`);
                    if (r.error) console.log(`         ${RED}Error: ${r.error}${RESET}`);
                    else console.log(`         ${YELLOW}Reply: "${r.response}" | detected:${r.responseLang} expected:${r.expectedLang}${RESET}`);
                }
            }
        }

        summary.push({ name: companion.name, passed, failed, langMismatch });

        // Small pause between companions to avoid rate limits
        await new Promise(r => setTimeout(r, 500));
    }

    const total = COMPANIONS.length * 5;
    const pct = Math.round((totalPassed / total) * 100);

    console.log(`\n${BOLD}${CYAN}═══════════════════ SUMMARY ═══════════════════${RESET}`);
    console.log(`${BOLD}Total Messages:   ${total}${RESET}`);
    console.log(`${GREEN}Passed:           ${totalPassed}${RESET}`);
    console.log(`${RED}Failed (errors):  ${totalFailed}${RESET}`);
    console.log(`${YELLOW}Lang mismatches:  ${totalLangMismatch}${RESET}`);
    console.log(`${BOLD}Success rate:     ${pct}%${RESET}`);

    if (pct === 100) {
        console.log(`\n${GREEN}${BOLD}🎉 All companions healthy!${RESET}\n`);
    } else if (pct >= 80) {
        console.log(`\n${YELLOW}${BOLD}⚠  Mostly healthy — check failed companions above${RESET}\n`);
    } else {
        console.log(`\n${RED}${BOLD}❌ Multiple failures — check proxy and API key${RESET}\n`);
    }
}

main().catch(e => {
    console.error(`${RED}FATAL: ${e.message}${RESET}`);
    process.exit(1);
});
