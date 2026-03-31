import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dostai';

let isConnected = false;

export const connectDB = async () => {
    if (isConnected) return true;

    if (!process.env.MONGO_URI) {
        console.warn(`[Database] MONGO_URI is missing. Falling back to default: ${MONGO_URI}`);
    }

    try {
        console.log(`[Database] Connecting to MongoDB at ${MONGO_URI.split('://')[1].split('/')[0]}...`);
        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 5000, // 5 second timeout
        });
        isConnected = true;
        console.log(`[Database] MongoDB Connected Successfully`);
        return true;
    } catch (error) {
        console.error(`[Database] Connection Failed: ${error.message}`);
        console.error(`[Database] Error Stack: ${error.stack}`);
        return false;
    }
};
