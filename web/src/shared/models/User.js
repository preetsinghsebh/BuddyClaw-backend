import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    chatId: { type: String, required: true, unique: true },
    personaId: { type: String },
    aiName: { type: String },
    systemPrompt: { type: String },
    nicknames: [String],
    jokes: [String],
    facts: [String],
    attachments: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now },
    isSubscribed: { type: Boolean, default: false }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
export default User;
