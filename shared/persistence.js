import fs from 'fs';
import path from 'path';
import Log from './models/Log.js';

/**
 * Telemetry: Centralized logging class that records to both console and MongoDB.
 */
export class Telemetry {
    constructor(service) {
        this.service = service;
    }

    async log(level, message, metadata = {}, chatId = null, personaId = null) {
        const timestamp = new Date().toISOString();
        const logContent = `[${timestamp}] [${this.service.toUpperCase()}] [${level.toUpperCase()}] ${message}`;
        
        // Always console log
        if (level === 'error') console.error(logContent, metadata);
        else if (level === 'warn') console.warn(logContent, metadata);
        else console.log(logContent);

        // Persistent Log to MongoDB if connected
        try {
            if (Log && Log.create) {
                await Log.create({
                    service: this.service,
                    level: level,
                    message: message,
                    chatId: chatId,
                    personaId: personaId,
                    metadata: metadata
                });
            }
        } catch (err) {
            // Silently fail if DB is not connected to avoid crashing the service
            console.error(`[Telemetry:DB] Log failed: ${err.message}`);
        }
    }

    info(message, metadata, chatId, personaId) { return this.log('info', message, metadata, chatId, personaId); }
    warn(message, metadata, chatId, personaId) { return this.log('warn', message, metadata, chatId, personaId); }
    error(message, metadata, chatId, personaId) { return this.log('error', message, metadata, chatId, personaId); }
    debug(message, metadata, chatId, personaId) { return this.log('debug', message, metadata, chatId, personaId); }
}

/**
 * PersistentMap: A Map wrapper that periodically syncs to its backend.
 * Supports local JSON or MongoDB.
 */
export class PersistentMap extends Map {
    constructor(filePathOrModel, options = {}) {
        super();
        this.mode = options.mode || 'json'; // 'json' or 'mongo'
        
        if (this.mode === 'json') {
            this.filePath = path.resolve(filePathOrModel);
            this.saveInterval = options.saveInterval || 5000;
            this.isSaving = false;
            this.initJson();
        } else {
            this.model = filePathOrModel;
            this.service = options.service || 'unknown';
            // In Mongo mode, we initialize from DB if requested, or just use as a set/get wrapper
        }
    }

    initJson() {
        try {
            if (fs.existsSync(this.filePath)) {
                const raw = fs.readFileSync(this.filePath, 'utf8');
                if (raw.trim()) {
                    const data = JSON.parse(raw);
                    if (Array.isArray(data)) {
                        data.forEach(([key, value]) => super.set(key, value));
                        console.log(`[Persistence:JSON] Loaded ${this.size} records from ${path.basename(this.filePath)}`);
                    }
                }
            } else {
                fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
            }
        } catch (err) {
            console.error(`[Persistence:JSON] Error loading ${this.filePath}:`, err.message);
        }
    }

    async set(key, value) {
        super.set(key, value);
        if (this.mode === 'json') {
            this.scheduleSave();
        } else if (this.model) {
            try {
                if (this.model.modelName === 'User') {
                    await this.model.findOneAndUpdate(
                        { chatId: key },
                        { ...value, chatId: key },
                        { upsert: true }
                    );
                } else if (this.model.modelName === 'Memory' || this.model.modelName === 'Chat') {
                    // Optimized for both Memory and Chat models
                    await this.model.findOneAndUpdate(
                        { chatId: key, service: this.service },
                        { summary: value, chatId: key, service: this.service },
                        { upsert: true }
                    );
                }
            } catch (err) {
                console.error(`[Persistence:Mongo] Set failed for ${key}:`, err.message);
            }
        }
        return this;
    }

    get(key) {
        return super.get(key);
    }

    scheduleSave() {
        if (this.isSaving) return;
        this.isSaving = true;
        setTimeout(() => {
            this.save();
            this.isSaving = false;
        }, this.saveInterval);
    }

    save() {
        if (this.mode !== 'json') return;
        try {
            const data = Array.from(this.entries());
            fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf8');
        } catch (err) {
            console.error(`[Persistence:JSON] Error saving ${this.filePath}:`, err.message);
        }
    }
}

/**
 * VectorMemory: A semantic-ready memory store. 
 */
export class VectorMemory {
    constructor(filePathOrModel, options = {}) {
        this.mode = options.mode || 'json';
        if (this.mode === 'json') {
            this.persistentMap = new PersistentMap(filePathOrModel);
        } else {
            this.model = filePathOrModel;
            this.service = options.service;
        }
    }

    async add(chatId, text) {
        if (!text || text.length < 5) return; // Ignore very short messages
        
        if (this.mode === 'json') {
            const memories = this.persistentMap.get(chatId) || [];
            memories.push({
                text,
                timestamp: new Date().toISOString(),
                keywords: text.toLowerCase().split(/[\s,!?.]+/).filter(w => w.length > 3)
            });
            // Keep only latest 50 anchors to avoid bloat
            if (memories.length > 50) memories.shift();
            this.persistentMap.set(chatId, memories);
        } else {
            try {
                await this.model.findOneAndUpdate(
                    { chatId, service: this.service },
                    { 
                        $push: { 
                            anchors: { 
                                $each: [{ 
                                    text, 
                                    keywords: text.toLowerCase().split(/[\s,!?.]+/).filter(w => w.length > 3) 
                                }],
                                $slice: -50 // Keep latest 50
                            } 
                        } 
                    },
                    { upsert: true }
                );
            } catch (err) {
                console.error(`[Vector:Mongo] Add failed:`, err.message);
            }
        }
    }

    async query(chatId, queryText, limit = 3) {
        if (!queryText) return [];
        
        let memories = [];
        if (this.mode === 'json') {
            memories = this.persistentMap.get(chatId) || [];
        } else {
            const doc = await this.model.findOne({ chatId, service: this.service });
            memories = doc ? doc.anchors : [];
        }

        if (!memories.length) return [];
        
        const queryWords = queryText.toLowerCase().split(/[\s,!?.]+/).filter(w => w.length > 3);
        if (queryWords.length === 0) return [];

        const scored = memories.map(m => {
            let score = 0;
            const textLower = m.text.toLowerCase();
            
            // Keyword scoring
            queryWords.forEach(q => {
                if (textLower.includes(q)) score += 2; // Exact word match
                else if (q.length > 5 && textLower.includes(q.slice(0, -1))) score += 1; // Partial match
            });

            // Recency bias: Newer memories get a slight boost
            const ageFactor = (new Date() - new Date(m.timestamp)) / (1000 * 60 * 60 * 24); // age in days
            score *= Math.max(0.5, 1 - (ageFactor / 30)); // 30-day decay

            return { ...m, score };
        });

        return scored
            .filter(m => m.score > 0.5)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(m => m.text);
    }
}
