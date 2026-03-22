import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
    service: { type: String, required: true },
    level: { type: String, enum: ['info', 'warn', 'error', 'debug'], default: 'info' },
    message: { type: String, required: true },
    chatId: { type: String },
    personaId: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Index for fast querying during debugging
logSchema.index({ service: 1, timestamp: -1 });
logSchema.index({ chatId: 1, timestamp: -1 });

const Log = mongoose.models.Log || mongoose.model('Log', logSchema);

export default Log;
