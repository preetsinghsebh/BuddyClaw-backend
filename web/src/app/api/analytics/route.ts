import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { eventName, properties, timestamp } = body;

        // In a standalone frontend on Vercel, we can't write to a local JSON file.
        // We log to the console for now. In production, you would use a service like 
        // Mixpanel, PostHog, or a dedicated MongoDB collection.
        console.log(`[Analytics] Event: ${eventName}`, properties, timestamp);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Analytics Error:', error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
