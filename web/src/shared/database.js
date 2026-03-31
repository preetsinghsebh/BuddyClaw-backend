import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dostai';

let isConnected = false;

export const connectDB = async () => {
    if (isConnected && mongoose.connection.readyState === 1) return;

    try {
        const maskedUri = MONGO_URI.replace(/:([^@]+)@/, ':****@');
        console.log(`[Database] Attempting connection to: ${maskedUri}`);
        
        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of default
        });
        
        isConnected = true;
        console.log(`[Database] MongoDB Connected Successfully`);
    } catch (error) {
        console.error(`[Database] Connection Failed: ${error.message}`);
        isConnected = false;
        throw error; // Throw so the API can catch it
    }
};
