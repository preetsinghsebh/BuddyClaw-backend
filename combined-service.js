import './shared/env.js';
import express from 'express';
import cors from 'cors';
import { connectDB } from './shared/database.js';
import { Telemetry } from './shared/persistence.js';

// Import init functions from all services
import { init as initProxy } from './sarvam-proxy/adapter.js';
import { init as initZiva } from './ziva-service/src/index.js';
import { init as initLiam } from './liam-service/src/index.js';
import { init as initAnime } from './anime-service/src/index.js';
import { init as initCeleb } from './celeb-service/src/index.js';
import { init as initSafeSpace } from './safespace-service/src/index.js';
import { init as initMindReset } from './mindreset-service/src/index.js';
import { init as initChaos } from './openclaw-service/src/index.js';

const telemetry = new Telemetry('mono-service');
const log = (module, msg) => telemetry.info(`[${module}] ${msg}`);

async function start() {
    log('Master', '🚀 Starting DostAI Mono-Service orchestration...');

    // 1. Initialize Shared Database
    const dbSuccess = await connectDB();
    if (!dbSuccess) {
        log('Master', '❌ Failed to connect to MongoDB. Exiting.');
        process.exit(1);
    }
    log('Master', '✅ Shared MongoDB Connected.');

    // 2. Create Master Express App
    const app = express();
    app.use(cors());
    app.use(express.json());

    const PORT = process.env.PORT || 3000;
    
    // Set internal Proxy URL for bots to reach the shared proxy middleware
    if (!process.env.SARVAM_PROXY_URL) {
        process.env.SARVAM_PROXY_URL = `http://localhost:${PORT}/v1/chat/completions`;
        log('Master', `Setting internal SARVAM_PROXY_URL to ${process.env.SARVAM_PROXY_URL}`);
    }

    // 3. Initialize all services
    log('Master', '📦 Initializing Sarvam Proxy...');
    await initProxy(app);

    log('Master', '🤖 Initializing Bot Microservices with unique tokens...');
    // Sequential initialization with specific tokens from environment
    log('Master', 'Initializing Bot Services sequentially...');
    const delay = (ms) => new Promise(res => setTimeout(res, ms));

    const initSafe = async (name, initFunc, token) => {
        try {
            log('Master', `Starting ${name.toUpperCase()}...`);
            await initFunc(app, token, name);
            log('Master', `✅ ${name.toUpperCase()} initialized.`);
        } catch (e) {
            log('Master', `❌ Failed to initialize ${name.toUpperCase()}: ${e.message}`);
        }
    };

    await initSafe('ziva', initZiva, process.env.ZIVA_BOT_TOKEN);
    await delay(2000);
    await initSafe('liam', initLiam, process.env.LIAM_BOT_TOKEN);
    await delay(2000);
    await initSafe('emma', initZiva, process.env.EMMA_BOT_TOKEN);
    await delay(2000);
    await initSafe('zane', initLiam, process.env.ZANE_BOT_TOKEN);
    await delay(2000);
    await initSafe('anime', initAnime, process.env.ANIME_BOT_TOKEN);
    await delay(2000);
    await initSafe('celeb', initCeleb, process.env.CELEB_BOT_TOKEN);
    await delay(2000);
    await initSafe('safespace', initSafeSpace, process.env.SAFESPACE_BOT_TOKEN);
    await delay(2000);
    await initSafe('mindreset', initMindReset, process.env.MINDRESET_BOT_TOKEN);
    await delay(2000);
    await initSafe('chaos', initChaos, process.env.CHAOS_BOT_TOKEN);

    // 4. Global Health Check
    app.get('/health', (req, res) => {
        res.json({
            status: 'healthy',
            service: 'dostai-combined',
            subservices: ['proxy', 'ziva', 'liam', 'emma', 'zane', 'anime', 'celeb', 'safespace', 'mindreset', 'chaos'],
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            env: process.env.NODE_ENV
        });
    });

    // 5. Start Server
    app.listen(PORT, '0.0.0.0', () => {
        log('Master', `✨ DostAI Mono-Service live on port ${PORT}`);
        log('Master', 'All 10 backend components (9 bots + 1 proxy) active and shared.');
    });
}

start().catch(err => {
    console.error('CRITICAL: Mono-Service startup failed:', err);
    process.exit(1);
});
