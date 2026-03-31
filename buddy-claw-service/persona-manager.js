import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.resolve(__dirname, 'config', 'personas.json');
const DEFAULT_PERSONA_ID = 'ziva';

export class PersonaManager {
    constructor() {
        this.configPath = CONFIG_PATH;
        this.personas = new Map();
    }

    async load() {
        try {
            const raw = await fs.readFile(this.configPath, 'utf8');
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) {
                throw new Error('Persona configuration must be an array');
            }
            this.personas.clear();
            parsed.forEach((entry) => {
                if (entry?.id) {
                    const key = entry.id.toLowerCase();
                    this.personas.set(key, { ...entry, id: key });
                }
            });
            console.log(`[PersonaManager] Loaded ${this.personas.size} personas`);
        } catch (error) {
            console.error(`[PersonaManager] Failed to load personas: ${error.message}`);
        }
    }

    async ensureLoaded() {
        if (this.personas.size === 0) {
            await this.load();
        }
    }

    async list() {
        await this.ensureLoaded();
        return Array.from(this.personas.values());
    }

    async getPersona(id) {
        await this.ensureLoaded();
        if (!id) return this.personas.get(DEFAULT_PERSONA_ID);
        return this.personas.get(id.toLowerCase()) || this.personas.get(DEFAULT_PERSONA_ID);
    }

    async addPersona(data) {
        if (!data?.id) return false;
        await this.ensureLoaded();
        const normalizedId = data.id.toLowerCase();
        this.personas.set(normalizedId, { ...data, id: normalizedId });
        await this.saveToDisk();
        return true;
    }

    async updatePersonaPrompt(id, newPrompt) {
        if (!id || !newPrompt) return false;
        await this.ensureLoaded();
        const normalizedId = id.toLowerCase();
        const persona = this.personas.get(normalizedId);
        if (!persona) return false;
        persona.systemPrompt = newPrompt;
        this.personas.set(normalizedId, persona);
        await this.saveToDisk();
        return true;
    }

    async saveToDisk() {
        try {
            const list = Array.from(this.personas.values());
            await fs.writeFile(this.configPath, JSON.stringify(list, null, 2));
            console.log(`[PersonaManager] Saved ${list.length} personas to disk`);
        } catch (error) {
            console.error(`[PersonaManager] Failed to persist personas: ${error.message}`);
        }
    }
}

export const personaManager = new PersonaManager();
