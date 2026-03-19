"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Sparkles, User, MessageCircle, Languages } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const LANGUAGE_OPTIONS = [
    { id: "hinglish", label: "Hinglish", desc: "Mix of Hindi & English (Most Natural)" },
    { id: "hindi", label: "Pure Hindi", desc: "Devanagari text" },
    { id: "english", label: "English", desc: "Simple English" },
];

export default function CustomizePage() {
    const router = useRouter();
    // We can eventually grab the selected role from URL query params (e.g. ?role=romantic)
    // const searchParams = useSearchParams();
    // const role = searchParams.get("role") || "midnight";

    const [name, setName] = useState("");
    const [language, setLanguage] = useState("hinglish");
    const [vibe, setVibe] = useState([50]); // 0 = Calm, 100 = Chaotic
    const [loading, setLoading] = useState(false);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // TODO: Save to Supabase and navigate to subscription/dashboard
        setTimeout(() => {
            setLoading(false);
            router.push("/subscription"); // Redirect to premium screen next
        }, 1000);
    };

    const getVibeText = (val: number) => {
        if (val < 20) return "Ultra Calm & Soothing 🍵";
        if (val < 40) return "Warm & Gentle 🌻";
        if (val < 60) return "Balanced & Friendly 😊";
        if (val < 80) return "Playful & Teasing 😜";
        return "Maximum Chaotic Energy 🌪️";
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#A78BFA]/20 via-[#C4B5FD]/10 to-[#FECDD3]/20 dark:from-indigo-950/40 dark:via-background dark:to-rose-950/20 py-12 px-4 flex justify-center items-center">

            <div className="absolute top-6 left-6">
                <Link href="/" className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-lavender-500 to-rose-400">DostAI</span>
                    <span>❤️</span>
                </Link>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl bg-white/70 dark:bg-black/60 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/40 dark:border-white/10 shadow-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <Sparkles className="w-32 h-32 text-lavender-500" />
                </div>

                <div className="mb-10 text-center">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">
                        Design Your Companion
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-lg max-w-md mx-auto">
                        Give them a name, pick their vibe, and choose how they text you on WhatsApp.
                    </p>
                </div>

                <form onSubmit={handleSave} className="space-y-10 relative z-10">

                    {/* AI Name */}
                    <div className="space-y-3">
                        <Label className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                            <User className="w-5 h-5 text-lavender-500" /> What should we call them?
                        </Label>
                        <Input
                            placeholder="e.g. Aarohi, Rahul, Priya..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="h-14 text-lg bg-white/50 dark:bg-black/50 border-gray-200 dark:border-gray-800 focus:ring-lavender-500 focus:border-lavender-500 rounded-xl"
                        />
                        <p className="text-sm text-gray-500 dark:text-gray-400 pl-1">
                            Suggestions: <span className="cursor-pointer hover:text-lavender-500" onClick={() => setName("Aarohi")}>Aarohi</span>, <span className="cursor-pointer hover:text-lavender-500" onClick={() => setName("Rahul")}>Rahul</span>, <span className="cursor-pointer hover:text-lavender-500" onClick={() => setName("Simran")}>Simran</span>
                        </p>
                    </div>

                    {/* Personality Vibe Slider */}
                    <div className="space-y-5 bg-gradient-to-r from-lavender-50 to-rose-50 dark:from-indigo-950/20 dark:to-rose-950/20 p-6 rounded-2xl border border-white/40 dark:border-white/5">
                        <div className="flex justify-between items-end">
                            <Label className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-rose-400" /> Personality Vibe
                            </Label>
                            <span className="text-sm font-bold text-lavender-600 dark:text-lavender-400 bg-white/80 dark:bg-black/50 px-3 py-1 rounded-full shadow-sm">
                                {getVibeText(vibe[0])}
                            </span>
                        </div>

                        <Slider
                            value={vibe}
                            onValueChange={setVibe}
                            max={100}
                            step={1}
                            className="py-4 cursor-pointer"
                        />

                        <div className="flex justify-between text-xs font-medium text-gray-500 dark:text-gray-400 px-1">
                            <span>Calm</span>
                            <span>Chaotic</span>
                        </div>
                    </div>

                    {/* Language Preference */}
                    <div className="space-y-4">
                        <Label className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                            <Languages className="w-5 h-5 text-teal-500" /> Language Tone
                        </Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {LANGUAGE_OPTIONS.map((lang) => (
                                <div
                                    key={lang.id}
                                    onClick={() => setLanguage(lang.id)}
                                    className={`p-4 rounded-xl cursor-pointer border transition-all ${language === lang.id ? "bg-white dark:bg-gray-800 border-lavender-500 shadow-md ring-1 ring-lavender-500" : "bg-white/40 dark:bg-black/40 border-gray-200 dark:border-gray-800 hover:border-lavender-300"}`}
                                >
                                    <p className="font-semibold text-gray-900 dark:text-white mb-1">{lang.label}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{lang.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Submit */}
                    <Button
                        type="submit"
                        disabled={!name || loading}
                        className="w-full h-16 rounded-2xl text-xl font-bold bg-gradient-to-r from-lavender-500 to-rose-400 hover:from-lavender-600 hover:to-rose-500 text-white shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 mt-4"
                    >
                        {loading ? "Matching..." : (
                            <>Create My Companion <MessageCircle className="ml-3 w-6 h-6" /></>
                        )}
                    </Button>

                </form>
            </motion.div>
        </div>
    );
}
