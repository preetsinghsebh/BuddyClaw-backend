import fs from 'fs';
import path from 'path';

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
                const data = JSON.parse(raw);
                if (Array.isArray(data)) {
                    data.forEach(([key, value]) => super.set(key, value));
                    console.log(`[Persistence:JSON] Loaded ${this.size} records from ${path.basename(this.filePath)}`);
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
                } else if (this.model.modelName === 'Memory') {
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
        if (this.mode === 'json') {
            const memories = this.persistentMap.get(chatId) || [];
            memories.push({
                text,
                timestamp: new Date().toISOString(),
                keywords: text.toLowerCase().split(' ').filter(w => w.length > 3)
            });
            this.persistentMap.set(chatId, memories);
        } else {
            try {
                await this.model.findOneAndUpdate(
                    { chatId, service: this.service },
                    { 
                        $push: { 
                            anchors: { 
                                text, 
                                keywords: text.toLowerCase().split(' ').filter(w => w.length > 3) 
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
        let memories = [];
        if (this.mode === 'json') {
            memories = this.persistentMap.get(chatId) || [];
        } else {
            const doc = await this.model.findOne({ chatId, service: this.service });
            memories = doc ? doc.anchors : [];
        }

        if (!memories.length) return [];
        const queryWords = queryText.toLowerCase().split(' ').filter(w => w.length > 3);
        
        const scored = memories.map(m => {
            let score = 0;
            queryWords.forEach(q => {
                if (m.text.toLowerCase().includes(q)) score += 1;
            });
            return { ...m, score };
        });

        return scored
            .filter(m => m.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(m => m.text);
    }
}
