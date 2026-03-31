import mongoose from 'mongoose';
import '../shared/env.js';
import Log from '../shared/models/Log.js';

const MONGO_URI = process.env.MONGO_URI;

async function getLogs() {
    const dbs = ['', 'dostai', 'friendclaw', 'test'];
    
    for (const dbName of dbs) {
        try {
            const uri = dbName ? MONGO_URI.replace('.net/', `.net/${dbName}`) : MONGO_URI;
            console.log(`Trying database: ${dbName || 'default'}...`);
            
            const conn = await mongoose.createConnection(uri, { serverSelectionTimeoutMS: 5000 }).asPromise();
            const LogModel = conn.model('Log', Log.schema);
            
            const logs = await LogModel.find({})
                .sort({ timestamp: -1 })
                .limit(5)
                .lean();
                
            if (logs.length > 0) {
                console.log(`--- LATEST LOGS (DB: ${dbName || 'default'}) ---`);
                logs.forEach(l => {
                    const time = new Date(l.timestamp).toLocaleString();
                    console.log(`[${time}] [${l.service}] [${l.level}] ${l.message}`);
                });
            } else {
                console.log(`No logs found in ${dbName || 'default'}.`);
            }
            await conn.close();
        } catch (err) {
            console.error(`Error with ${dbName || 'default'}:`, err.message);
        }
    }
    console.log('Could not find logs in any known database.');
    process.exit(1);
}

getLogs();
