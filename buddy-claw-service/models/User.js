import mongoose from 'mongoose';

const BuddyUserSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    activePersonaId: { type: String, default: 'ziva' },
    memory: {
        type: [{
            role: { type: String, enum: ['user', 'assistant', 'system'] },
            content: String
        }],
        default: []
    },
    xp: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now }
}, { timestamps: true });

const BuddyUser = mongoose.models.BuddyUser || mongoose.model('BuddyUser', BuddyUserSchema);
export default BuddyUser;
