import { NextResponse } from 'next/server';
import { connectDB } from '@/shared/database';
import User from '@/shared/models/User';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('id');

    if (!chatId) {
        return NextResponse.json({ error: 'Chat ID required' }, { status: 400 });
    }

    try {
        await connectDB();
        
        const user = (await User.findOne({ chatId: String(chatId) }).lean()) as any;

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Map MongoDB fields to the frontend profile structure
        const profile = {
            nicknames: user.nicknames || [],
            facts: user.facts || [],
            streakCount: user.streak || 0,
            moodScore: 85, // Mocked for now, can be calculated from Memory in future
            lastChatDate: user.lastActive ? new Date(user.lastActive).toLocaleDateString() : "Recently"
        };

        // If user has a persona selected, show it as active
        const activePersonas = user.personaId ? [{
            id: user.personaId,
            name: user.aiName || "Your Companion",
            imageUrl: `/assets/companions/${user.personaId}.png` 
        }] : [];

        return NextResponse.json({
            profile,
            activePersonas
        });
    } catch (err) {
        console.error('API Error:', err);
        return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
    }
}
