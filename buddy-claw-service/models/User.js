import mongoose from 'mongoose';

const BuddyUserSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    activePersonaId: { type: String, default: 'ziva' },
    totalMessages: { type: Number, default: 0 },
    memory: {
        type: [{
            role: { type: String, enum: ['user', 'assistant', 'system'] },
            content: String
        }],
        default: []
    },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    relationshipStage: { type: String, default: 'Stranger' },
    nicknames: { type: [String], default: [] },
    facts: { type: [String], default: [] },
    streak: { type: Number, default: 0 },
    lastActiveAt: { type: Date, default: Date.now }
}, { timestamps: true });

const BuddyUser = mongoose.models.BuddyUser || mongoose.model('BuddyUser', BuddyUserSchema);
export default BuddyUser;
