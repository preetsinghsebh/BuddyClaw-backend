import mongoose from 'mongoose';

const ChatSchema = new mongoose.Schema({
    chatId: { type: String, required: true },
    service: { type: String, required: true },
    messages: [{
        role: { type: String, enum: ['system', 'user', 'assistant'] },
        content: String,
        timestamp: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

ChatSchema.index({ chatId: 1, service: 1 }, { unique: true });

const Chat = mongoose.models.Chat || mongoose.model('Chat', ChatSchema);
export default Chat;
