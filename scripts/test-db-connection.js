import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testConnection() {
    const uri = process.env.MONGO_URI;
    
    if (!uri) {
        console.error('❌ Error: MONGO_URI not found in .env file');
        process.exit(1);
    }

    console.log('📡 Attempting to connect to MongoDB Atlas...');
    console.log(`🔗 Target: ${uri.split('@')[1]}`); // Log only the host for security

    try {
        await mongoose.connect(uri);
        console.log('✅ SUCCESS! Your project is now connected to the Cloud "BuddyClaw" database.');
        
        // Check collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`📦 Found ${collections.length} collections in the database.`);
        
        await mongoose.disconnect();
        console.log('👋 Disconnected. You are ready for Oracle Cloud!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Connection Failed!');
        console.error(error.message);
        
        if (error.message.includes('IP address')) {
            console.log('\n💡 Hint: It looks like your IP is blocked. Go to "Network Access" in Atlas and add 0.0.0.0/0');
        }
        
        process.exit(1);
    }
}

testConnection();
