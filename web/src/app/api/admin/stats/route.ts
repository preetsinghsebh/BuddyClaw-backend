import { NextResponse } from 'next/server';
import { connectDB } from '@/shared/database';
import User from '@/shared/models/User';
import Chat from '@/shared/models/Chat';

import mongoose from 'mongoose';

export async function GET() {
    try {
        console.log('[AdminAPI] Connecting to DB...');
        await connectDB();
        console.log('[AdminAPI] Connection state:', mongoose.connection.readyState);
        console.log('[AdminAPI] User model connection state:', User.db.readyState);
        
        if (User.db.readyState !== 1) {
            throw new Error(`User model database connection not ready (state: ${User.db.readyState})`);
        }

        // 1. Unique Users (Pilots)
        const uniqueUsers = await User.countDocuments();

        // 2. Total Interactions (Messages)
        // We sum the length of the messages array in each Chat document
        const chatStats = await Chat.aggregate([
            { $project: { messageCount: { $size: "$messages" } } },
            { $group: { _id: null, total: { $sum: "$messageCount" } } }
        ]);
        const totalEvents = chatStats[0]?.total || 0;

        // 3. Top Persona
        const personaStats = await User.aggregate([
            { $group: { _id: "$personaId", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 1 }
        ]);
        const topPersona = personaStats[0]?._id || 'None';

        // 4. Recent Stream (Last 5 Activity)
        const recentChats = await Chat.find()
            .sort({ updatedAt: -1 })
            .limit(5)
            .lean();

        const recentEvents = recentChats.map(chat => ({
            time: 'Live',
            event: 'message_received',
            user: `User_${chat.chatId.slice(-4)}`,
            details: `Service: ${chat.service}`
        }));

        return NextResponse.json({
            totalEvents,
            uniqueUsers,
            topPersona: topPersona.charAt(0).toUpperCase() + topPersona.slice(1),
            topCategory: 'Active Production',
            recentEvents
        });

    } catch (error: any) {
        console.error('[AdminAPI] Stats Error:', error);
        const maskedUri = (process.env.MONGODB_URI || 'UNDEFINED').replace(/:([^@]+)@/, ':****@');
        return NextResponse.json({ 
            error: 'Internal Server Error', 
            message: error.message,
            uri: maskedUri 
        }, { status: 500 });
    }
}
