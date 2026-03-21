"use client";
import { getTelegramLink } from "@/lib/telegram";

import { motion } from "framer-motion";
import { Sparkles, Brain, Share2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

export default function DailyVibesPage() {
    return (
        <Suspense fallback={<div>Loading Vibes...</div>}>
            <VibesContent />
        </Suspense>
    );
}

function VibesContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeTab = searchParams.get("tab") || "horoscope";
    const [date, setDate] = useState("");

    useEffect(() => {
        setDate(new Date().toLocaleDateString("en-US", {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }));
    }, []);

    const vibesData = {
        horoscope: {
            title: "Your Daily Horoscope",
            icon: "🌟♈",
            content: "The stars are aligning for a major breakthrough in your creative pursuits today. Trust your intuition when a sudden idea strikes—it's more than just a whim. Mercury’s influence suggests a clear path for communication, making it the perfect time to reach out to someone you've been thinking about. Stay grounded, stay curious, and let the universe guide your steps.",
            shareText: "🌟 My Daily Horoscope - [DATE]\n\n[CONTENT]\n\nFind your vibe on BuddyClaw! ✨"
        },
        affirmation: {
            title: "Daily Affirmation",
            icon: "💫🤍",
            content: "I am the architect of my own happiness, and today I choose to build with love, patience, and unwavering confidence.",
            shareText: "💫 My Daily Affirmation - [DATE]\n\n\"[CONTENT]\"\n\nStart your day with BuddyClaw! ✨"
        },
        question: {
            title: "Question of the Day",
            icon: "❓✨",
            content: "What is one thing you can do today that your future self will thank you for deeply?",
            shareText: "❓ My Daily Question - [DATE]\n\n[CONTENT]\n\nReflect with me on BuddyClaw! ✨"
        }
    };
    const currentVibe = activeTab in vibesData ? vibesData[activeTab as keyof typeof vibesData] : vibesData.horoscope;

    const copyVibes = () => {
        const text = currentVibe.shareText
            .replace("[DATE]", date)
            .replace("[CONTENT]", currentVibe.content);
        navigator.clipboard.writeText(text);
        alert("Copied to clipboard! 🌟 Share the light!");
    };

    return (
        <div className="min-h-screen bg-black text-white relative flex flex-col items-center p-6 sm:p-12 selection:bg-[hsl(var(--accent-pink))]/30 font-inter">
            {/* Cosmic Background Layer */}
            <div className="absolute inset-0 -z-10 pointer-events-none">
                <div className="absolute inset-0 bg-black opacity-100" />

                {/* Floating Stars */}
                {[...Array(15)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0.2, scale: 0.5 }}
                        animate={{
                            opacity: [0.2, 0.8, 0.2],
                            scale: [0.5, 1, 0.5],
                            y: [0, -20, 0]
                        }}
                        transition={{
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 5
                        }}
                        className="absolute text-[hsl(var(--accent-pink))]/20 text-xs blur-[1px]"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`
                        }}
                    >
                        ✨
                    </motion.div>
                ))}
            </div>

            {/* Back Button */}
            <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => router.push('/')}
                className="absolute top-8 left-8 p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors z-20 border border-white/10 bubble-glow-hover"
            >
                <ArrowLeft className="w-5 h-5 text-white" />
            </motion.button>

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center z-10 mb-8 mt-12 sm:mt-0"
            >
                <Badge className="bg-gradient-to-r from-[hsl(var(--accent-pink))] to-[hsl(var(--accent-purple))] text-white border-0 shadow-[0_0_15px_hsla(300,100%,70%,0.5)] mb-4 px-4 py-1 animate-pulse font-manrope">
                    <Sparkles className="w-3 h-3 mr-2" /> Daily Inspiration
                </Badge>
                <h1 className="text-4xl sm:text-6xl font-anton tracking-wider text-white mb-2 mt-4">
                    Daily Vibes ✨
                </h1>
                <p className="text-gray-400 font-medium tracking-wide text-xs uppercase font-inter">
                    Updated for {date}
                </p>
            </motion.div>

            {/* Main Content Card */}
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-4xl z-10"
            >
                <div className="bubble-card p-8 sm:p-12 rounded-[3rem] shadow-2xl flex flex-col items-center text-center relative overflow-visible">
                    <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--accent-purple))]/5 to-transparent rounded-[3rem] pointer-events-none" />

                    <div className="text-6xl mb-6 animate-bounce-slow relative z-10">
                        {currentVibe.icon}
                    </div>
                    <h2 className="text-3xl font-anton text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--accent-pink))] to-[hsl(var(--accent-purple))] mb-6 tracking-wide relative z-10">
                        {currentVibe.title}
                    </h2>

                    {activeTab === 'affirmation' ? (
                        <p className="text-2xl sm:text-4xl font-extrabold leading-tight text-white/90 italic font-inter relative z-10">
                            &quot;{currentVibe.content}&quot;
                        </p>
                    ) : (
                        <p className="text-lg sm:text-xl text-gray-300 leading-relaxed font-medium font-inter relative z-10">
                            {currentVibe.content}
                        </p>
                    )}

                    {activeTab === 'question' && (
                        <div className="w-full mt-8 max-w-lg mx-auto relative z-10">
                            <input
                                type="text"
                                placeholder="Reflect here..."
                                className="w-full bg-black/60 border border-white/20 rounded-2xl px-6 py-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-[hsl(var(--accent-pink))] focus:ring-1 focus:ring-[hsl(var(--accent-pink))] transition-all font-inter"
                            />
                        </div>
                    )}

                    <div className="mt-12 flex flex-col sm:flex-row gap-4 relative z-10">
                        <Button
                            onClick={copyVibes}
                            className="rounded-full px-10 h-14 bg-white text-black font-manrope font-bold hover:bg-gray-200 bubble-glow-hover transition-all border border-white/10 relative overflow-hidden group w-full sm:w-auto"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--accent-pink))] to-[hsl(var(--accent-purple))] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <span className="relative z-10 flex items-center justify-center group-hover:text-white">
                                <Share2 className="w-4 h-4 mr-2" /> Share This
                            </span>
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => router.push('/')}
                            className="rounded-full px-10 h-14 text-white border border-white/10 hover:bg-white/5 font-manrope font-bold transition-all w-full sm:w-auto"
                        >
                            Explore More
                        </Button>
                    </div>
                </div>
            </motion.div>

            {/* Support Tooling */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="w-full max-w-4xl mt-12 z-10"
            >
                <div className="bubble-card rounded-[2.5rem] p-8 sm:p-10 relative overflow-hidden">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-[hsl(var(--accent-purple))]/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
                        <div className="flex-1 space-y-4 w-full">
                            <h3 className="text-xl font-anton text-[hsl(var(--accent-pink))] flex items-center gap-2 tracking-wide">
                                <Brain className="w-5 h-5" /> Dreamscape Journal 🌙
                            </h3>
                            <p className="text-sm text-gray-400 font-inter">
                                Describe a dream to have your active companion interpret its mystical symbols.
                            </p>
                            <textarea
                                placeholder="Describe your dream..."
                                className="w-full h-24 bg-black/60 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[hsl(var(--accent-pink))] transition-colors resize-none font-inter font-medium"
                                id="dream-input"
                            />
                            <Button
                                onClick={() => {
                                    const dream = (document.getElementById('dream-input') as HTMLTextAreaElement).value;
                                    if (!dream) return alert("Write your dream first! ✨");
                                    window.open(getTelegramLink(btoa(dream).slice(0, 20), 'interpret'), '_blank');
                                }}
                                className="w-full md:w-auto h-12 rounded-full bg-white/5 hover:bg-white/10 text-white border border-white/10 font-manrope font-bold bubble-glow-hover transition-all"
                            >
                                Interpret Dream 🔮
                            </Button>
                        </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-white/10 text-center relative z-10">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-black font-inter">
                            Daily inspiration only – not professional advice
                        </p>
                    </div>
                </div>
            </motion.div >
        </div >
    );
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
            {children}
        </span>
    );
}
