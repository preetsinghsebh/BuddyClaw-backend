import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/shared/database";
import User from "@/shared/models/User";

// Mock mapping of roles to base prompts
const rolePrompts: Record<string, string> = {
    // Healing Harbor
    midnight: "You are [AI_NAME], a reliable, deep-thinking late-night friend. Introspective, calm, and zero-judgment.",
// ... (rest of rolePrompts)
    greta_force: "You are [AI_NAME], a passionate Gen-Z change maker.",
    kev_roast: "You are [AI_NAME], a hilarious comedy roast master.",
};

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();
        const { userId, userName, aiName, roleId, language, phoneNumber } = body;

        // 1. Build Final System Prompt
        const basePrompt = rolePrompts[roleId] || rolePrompts["midnight"];
        let finalPrompt = basePrompt.replace("[AI_NAME]", aiName).replace("[USER_NAME]", userName);

        finalPrompt += `\n\nCommunicate naturally in ${language === "hinglish" ? "Hinglish (Hindi-English mix)" : language === "hindi" ? "pure Devanagari Hindi" : "English"} whenever it feels culturally appropriate for an Indian user.`;
        finalPrompt += `\nBe deeply empathetic, supportive, and non-judgmental. Never break character. Always reference past conversations.`;

        // Safety Disclaimer (CRITICAL RULE)
        finalPrompt += `\n\nAt the END of EVERY single response, include this exact disclaimer without exception: "I'm an AI companion here for emotional support and fun — not a therapist or medical professional. For help: Vandrevala 9999666555 or iCall 9152987821".`;

        // 2. Update User in MongoDB
        await User.findOneAndUpdate(
            { chatId: userId },
            { 
                personaId: roleId,
                aiName: aiName,
                systemPrompt: finalPrompt,
                lastActive: new Date()
            },
            { upsert: true, new: true }
        );

        console.log(`[Provision] Updated MongoDB config for user ${userId}`);

        return NextResponse.json({ success: true, message: "Companion provisioned successfully via MongoDB." });

    } catch (err: unknown) {
        console.error("Provisioning Error:", err instanceof Error ? err.message : "Unknown error");
        return NextResponse.json({ error: "Provisioning failed" }, { status: 500 });
    }
}
