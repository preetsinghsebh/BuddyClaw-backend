"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Home as HomeIcon, Heart, Smile, Star, Sun } from "lucide-react";

const features = [
    {
        id: "family",
        title: "Never Feel Alone Again ❤️",
        text: "Aunt's drama, Mom's care, Uncle's chill — your people, always here.",
        icon: HomeIcon,
        chatHistory: [
            { sender: "ai", text: "Aww honey! Did you even eat properly? It's getting late." },
            { sender: "user", text: "Mom, I'm feeling a bit exhausted today." },
            { sender: "ai", text: "Drink a glass of warm milk, put on your favorite show, and just rest. Don't stress too much." }
        ]
    },
    {
        id: "love-drama",
        title: "Love & Drama 💔",
        text: "Girlfriend hugs, secret admirer notes, long-distance soul talks.",
        icon: Heart,
        chatHistory: [
            { sender: "user", text: "I can't stop thinking about you today." },
            { sender: "ai", text: "Good. Keep thinking about me. I'll be right here waiting when you're done. ❤️" }
        ]
    },
    {
        id: "bestie",
        title: "Unfiltered & Unhinged 😂",
        text: "Savage roasts, meme wars, 2am party vibes — no filter needed.",
        icon: Smile,
        chatHistory: [
            { sender: "user", text: "Bro, I think I'm gonna text my ex..." },
            { sender: "ai", text: "Dude, I will literally break into your house and smash your phone. Put it DOWN right now." },
            { sender: "user", text: "Fine 🙄 but I'm getting bored." }
        ]
    },
    {
        id: "idols",
        title: "Channel That Celeb Energy 🌟",
        text: "Get advice from top founders, hype from pop stars like Bieber, or acting tips from Hollywood's best.",
        icon: Star,
        chatHistory: [
            { sender: "user", text: "Justin, I literally can't stop thinking about her. What should I do?" },
            { sender: "ai", text: "Is it too late now to say sorry? Cause if she's your one less lonely girl, you gotta just let her love you, man. Don't let her go." }
        ]
    },
    {
        id: "anime",
        title: "Your Ultimate Anime Arc 🌸",
        text: "Train with the Hashira, go on quests with heroes, or just chill in the slice-of-life verse.",
        icon: Sun,
        chatHistory: [
            { sender: "user", text: "Rengoku-san, I don't think I'm strong enough to face the demon..." },
            { sender: "ai", text: "Set your heart ablaze! Go beyond your limits! I believe in your potential! Now, stand up and let's eat some delicious bento! UMAI! 🍱🔥" }
        ]
    }
];

export function FeatureMockup() {
    const [activeFeature, setActiveFeature] = useState(0);

    return (
        <div suppressHydrationWarning className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center relative z-10">

            {/* Left Side: Phone Chat Mockup */}
            <div className="relative w-full max-w-[320px] mx-auto aspect-[9/19] rounded-[3rem] border-8 border-primary/5 bg-background shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col flex-shrink-0 z-20">
                {/* Phone Status/Header Bar */}
                <div className="h-16 flex flex-shrink-0 items-center justify-center border-b border-primary/5 bg-primary/5 backdrop-blur-md sticky top-0 z-10 w-full">
                    <div className="font-bold text-sm text-primary tracking-wide">BuddyClaw</div>
                    <div className="absolute right-6 w-2 h-2 rounded-full bg-[hsl(var(--accent-pink))] animate-pulse" />
                </div>

                {/* Chat Playback Area */}
                <div className="flex-1 p-5 flex flex-col gap-5 overflow-y-auto bg-primary/[0.02]">
                    {features[activeFeature].chatHistory.map((msg, i) => (
                        <motion.div
                            key={`${activeFeature}-${i}`}
                            initial={{ opacity: 0, y: 15, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.4, delay: i * 0.2 + 0.1, ease: [0.16, 1, 0.3, 1] }}
                            className={`max-w-[85%] rounded-[1.25rem] p-4 ${msg.sender === "user"
                                ? "self-end bg-primary text-primary-foreground rounded-tr-sm"
                                : "self-start bg-white/5 backdrop-blur-md border border-white/10 text-primary rounded-tl-sm shadow-sm"
                                }`}
                        >
                            <p className="text-[14px] font-medium leading-[1.6]">{msg.text}</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Right Side: Feature Accordion */}
            <div className="flex flex-col gap-4">
                {features.map((feature, idx) => {
                    const Icon = feature.icon;
                    const isActive = activeFeature === idx;

                    return (
                        <button
                            key={idx}
                            onClick={() => setActiveFeature(idx)}
                            className={`group text-left p-6 md:p-8 rounded-[2rem] border transition-all duration-500 ease-out outline-none ${isActive
                                ? "bg-white/5 border-[hsl(var(--accent-pink))]/30 shadow-[0_10px_40px_-10px_rgba(255,145,210,0.15)] md:translate-x-4"
                                : "bg-primary/5 border-transparent hover:bg-primary/10 hover:translate-x-2"
                                }`}
                        >
                            <div className="flex items-center gap-6">
                                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-500 ${isActive ? "bg-[hsl(var(--accent-pink))]/10 text-[hsl(var(--accent-pink))] scale-110" : "bg-primary/10 text-primary/50 group-hover:text-primary/70 group-hover:bg-primary/15"
                                    }`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <h3
                                    className={`text-2xl font-bold transition-colors duration-300 ${isActive ? "text-primary" : "text-primary/70"}`}
                                >
                                    {feature.title}
                                </h3>
                            </div>

                            {/* Expandable Text Content */}
                            <div className={`grid transition-all duration-500 ease-in-out ${isActive ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                                <div className="overflow-hidden">
                                    <p className={`text-[17px] text-primary/70 leading-relaxed font-medium pl-16 md:pl-20 mt-4 transition-opacity duration-500 delay-100 ${isActive ? "opacity-100" : "opacity-0"}`}>
                                        {feature.text}
                                    </p>
                                </div>
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    );
}
