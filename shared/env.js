import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// 1. Load local .env (if it exists)
dotenv.config();

// 2. Load root .env (for shared variables like MONGO_URI)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log(`[Shared Env] Loaded variables. (TELEGRAM_TOKEN: ${process.env.TELEGRAM_TOKEN ? 'OK' : 'MISSING'}, MONGO_URI: ${process.env.MONGO_URI ? 'OK' : 'MISSING'}, SARVAM_API_KEY: ${process.env.SARVAM_API_KEY ? 'OK' : 'MISSING'})`);
