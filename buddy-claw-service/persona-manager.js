import { promises as fs } from 'fs';
import path from 'path';
import mongoose from 'mongoose';

const DEFAULT_PATH = path.resolve(process.cwd(), 'config', 'personas.json');

// Schema for Personas if stored in MongoDB
const PersonaSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    systemPrompt: { type: String, required: true },
    tone: { type: String, default: 'neutral' },
    category: { type: String, default: 'General' },
    temperature: { type: Number, default: 0.7 }
}, { timestamps: true });

const PersonaModel = mongoose.models.Persona || mongoose.model('Persona', PersonaSchema);

export class PersonaManager {
    constructor(options = {}) {
        this.configPath = options.configPath
            ? path.resolve(process.cwd(), options.configPath)
            : DEFAULT_PATH;
        this.personas = new Map();
        this.lastMTime = null;
        this.useMongo = options.useMongo || false;
    }

    async load(force = false) {
        let loadedFromMongo = false;
        try {
            if (this.useMongo) {
                // Try to load from MongoDB with a short timeout
                const data = await PersonaModel.find({}).maxTimeMS(5000).exec();
                if (data && data.length > 0) {
                    this.personas.clear();
                    data.forEach((p) => this.personas.set(p.id, p.toObject()));
                    console.log(`[PersonaManager] Loaded ${this.personas.size} personas from MongoDB`);
                    loadedFromMongo = true;
                }
            }
        } catch (err) {
            console.warn(`[PersonaManager] MongoDB load failed (${err.message}). Falling back to JSON.`);
        }

        if (!loadedFromMongo) {
            try {
                const stats = await fs.stat(this.configPath);
                if (!force && this.lastMTime && this.lastMTime.getTime() === stats.mtime.getTime() && this.personas.size > 0) {
                    return;
                }
                const raw = await fs.readFile(this.configPath, 'utf8');
                const data = JSON.parse(raw);
                if (!Array.isArray(data)) {
                    throw new Error('Persona configuration must be an array');
                }
                this.personas.clear();
                data.forEach((entry) => {
                    if (entry.id && entry.systemPrompt) {
                        this.personas.set(entry.id, {
                            ...entry,
                            tone: entry.tone || 'neutral'
                        });
                    }
                });
                this.lastMTime = stats.mtime;
                console.log(`[PersonaManager] Loaded ${this.personas.size} personas from JSON config`);
            } catch (jsonErr) {
                console.error(`[PersonaManager] JSON fallback failed: ${jsonErr.message}`);
            }
        }
    }

    async ensureLoaded() {
        if (this.personas.size === 0) {
            await this.load();
        }
    }

    async addPersona(data) {
        this.personas.set(data.id, data);
        if (this.useMongo) {
            await PersonaModel.findOneAndUpdate({ id: data.id }, data, { upsert: true });
        }
        await this.saveToDisk();
    }

    async updatePersonaPrompt(id, newPrompt) {
        const persona = this.personas.get(id);
        if (persona) {
            persona.systemPrompt = newPrompt;
            this.personas.set(id, persona);
            if (this.useMongo) {
                await PersonaModel.findOneAndUpdate({ id }, { systemPrompt: newPrompt });
            }
            await this.saveToDisk();
            return true;
        }
        return false;
    }

    async saveToDisk() {
        try {
            const list = Array.from(this.personas.values());
            await fs.writeFile(this.configPath, JSON.stringify(list, null, 2));
            console.log(`[PersonaManager] Saved ${list.length} personas to JSON config`);
        } catch (err) {
            console.error(`[PersonaManager] Failed to save to disk: ${err.message}`);
        }
    }

    async getPersona(id) {
        await this.ensureLoaded();
        return this.personas.get(id);
    }

    async list() {
        await this.ensureLoaded();
        return Array.from(this.personas.values());
    }

    async refresh() {
        await this.load(true);
    }
}

export const personaManager = new PersonaManager({ useMongo: true });
