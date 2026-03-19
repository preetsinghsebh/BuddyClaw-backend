import mongoose from 'mongoose';

const MemorySchema = new mongoose.Schema({
    chatId: { type: String, required: true },
    service: { type: String, required: true }, // e.g., 'ziva', 'liam'
    summary: { type: String },
    anchors: [{
        text: String,
        keywords: [String],
        timestamp: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

MemorySchema.index({ chatId: 1, service: 1 }, { unique: true });

const Memory = mongoose.models.Memory || mongoose.model('Memory', MemorySchema);
export default Memory;
