import 'dotenv/config';
console.log('CWD:', process.cwd());
console.log('TELEGRAM_BOT_TOKEN:', process.env.TELEGRAM_BOT_TOKEN ? 'EXISTS' : 'MISSING');
