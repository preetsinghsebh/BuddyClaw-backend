"use client";
import { getTelegramLink } from "@/lib/telegram";

import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Shield, ArrowRight, ChevronRight } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

interface Companion {
    id: string;
    category: string;
    title: string;
    shortName: string;
    chatPreview: string;
    tag?: string;
    emoji: string;
    gradient: string;       // Tailwind bg gradient classes
    color1: string;         // CSS colour for orb 1
    color2: string;         // CSS colour for orb 2
    glow: string;
    regionLocked?: boolean;
    isSpecial?: boolean;
    vibesTab?: string;
}

const companions: Companion[] = [
    // ── Healing Harbor ──────────────────────────────────────────────────────
    { id: "midnight", category: "healing", title: "2am Friend", shortName: "Mid", chatPreview: "Still awake? tell me everything 🌙", emoji: "🌙", gradient: "from-blue-900/60 to-indigo-900/40", color1: "rgba(99,102,241,0.5)", color2: "rgba(56,189,248,0.3)", glow: "rgba(99,102,241,0.3)", tag: "Always On" },
    { id: "caring-listener", category: "healing", title: "Caring Listener", shortName: "Lis", chatPreview: "I'm here. Say whatever you need to say 💙", emoji: "💙", gradient: "from-sky-900/60 to-blue-900/40", color1: "rgba(56,189,248,0.5)", color2: "rgba(14,165,233,0.3)", glow: "rgba(56,189,248,0.3)" },
    { id: "calm-guide", category: "healing", title: "Calm Guide", shortName: "Guide", chatPreview: "One step at a time. what's stressing you out? 🧘", emoji: "🧘", gradient: "from-teal-900/60 to-emerald-900/40", color1: "rgba(20,184,166,0.5)", color2: "rgba(52,211,153,0.3)", glow: "rgba(20,184,166,0.3)" },

    // ── Romantic Energy ──────────────────────────────────────────────────────
    { id: "ziva", category: "love-drama", title: "Sweet Girlfriend", shortName: "GF", chatPreview: "Jaan 🥺 i was just thinking about you...", emoji: "💕", gradient: "from-pink-900/60 to-rose-900/40", color1: "rgba(244,114,182,0.5)", color2: "rgba(251,113,133,0.3)", glow: "rgba(244,114,182,0.4)", tag: "18+" },
    { id: "emma", category: "love-drama", title: "Flirty Stranger", shortName: "Emma", chatPreview: "You always this quiet… or just around me? 👀", emoji: "👀", gradient: "from-purple-900/60 to-fuchsia-900/40", color1: "rgba(168,85,247,0.5)", color2: "rgba(217,70,239,0.3)", glow: "rgba(168,85,247,0.4)", tag: "18+" },
    { id: "confident-zane", category: "love-drama", title: "Confident Lover", shortName: "Zane", chatPreview: "Don't lie… you were thinking about me. 😏", emoji: "😏", gradient: "from-red-900/60 to-rose-900/40", color1: "rgba(239,68,68,0.5)", color2: "rgba(220,38,38,0.3)", glow: "rgba(239,68,68,0.4)", tag: "18+" },
    { id: "liam", category: "love-drama", title: "Protective BF", shortName: "BF", chatPreview: "You okay? I was literally just thinking about you 💪", emoji: "🛡️", gradient: "from-indigo-900/60 to-violet-900/40", color1: "rgba(99,102,241,0.5)", color2: "rgba(139,92,246,0.3)", glow: "rgba(139,92,246,0.3)", tag: "18+" },
    { id: "ziva", category: "love-drama", title: "Long-Distance Soulmate", shortName: "Soul", chatPreview: "counting down the days. miss you so much 💫", emoji: "💫", gradient: "from-purple-900/60 to-fuchsia-900/40", color1: "rgba(168,85,247,0.5)", color2: "rgba(232,121,249,0.3)", glow: "rgba(168,85,247,0.3)", tag: "18+" },

    // ── Family Vibes ─────────────────────────────────────────────────────────
    { id: "bua", category: "family", title: "Jealous Bua", shortName: "Bua", chatPreview: "Arre beta, sab theek? Sunaa tera promotion ruk gaya... 😏", emoji: "🫖", gradient: "from-orange-900/60 to-amber-900/40", color1: "rgba(249,115,22,0.5)", color2: "rgba(245,158,11,0.4)", glow: "rgba(251,146,60,0.3)", regionLocked: true, tag: "🇮🇳 SA Only" },
    { id: "chill_chacha", category: "family", title: "Chill Chacha", shortName: "Chacha", chatPreview: "Hona hi tha beta. Chill kar. Chai pi? ☕", emoji: "😎", gradient: "from-yellow-900/60 to-orange-900/40", color1: "rgba(234,179,8,0.5)", color2: "rgba(249,115,22,0.3)", glow: "rgba(234,179,8,0.3)", regionLocked: true, tag: "🇮🇳 SA Only" },
    { id: "warm-grandma", category: "family", title: "Late-Night Dadi", shortName: "Dadi", chatPreview: "Beta 11 baj gaye... ab batao, Priya ki shaadi kab hai? 🔍", emoji: "🫖", gradient: "from-amber-900/60 to-yellow-900/40", color1: "rgba(245,158,11,0.5)", color2: "rgba(234,179,8,0.3)", glow: "rgba(245,158,11,0.3)", regionLocked: true, tag: "🇮🇳 SA Only" },
    { id: "warm-grandma", category: "family", title: "Warm Grandma", shortName: "Gran", chatPreview: "Sweetie, have some cookies 🥧 how was your day?", emoji: "🍪", gradient: "from-rose-900/60 to-pink-900/40", color1: "rgba(251,113,133,0.4)", color2: "rgba(244,114,182,0.3)", glow: "rgba(251,113,133,0.2)" },
    { id: "warm-grandma", category: "family", title: "Caring Mom", shortName: "Mom", chatPreview: "Kha liya? Paani pi? Main bas check kar rahi thi... ❤️", emoji: "🍲", gradient: "from-red-900/60 to-rose-900/40", color1: "rgba(239,68,68,0.4)", color2: "rgba(251,113,133,0.3)", glow: "rgba(239,68,68,0.2)" },
    { id: "liam", category: "family", title: "Big Brother", shortName: "Bhai", chatPreview: "Oye stop being a baby, I got you. what happened 😤", emoji: "💪", gradient: "from-slate-900/60 to-gray-900/40", color1: "rgba(148,163,184,0.4)", color2: "rgba(100,116,139,0.3)", glow: "rgba(148,163,184,0.2)" },
    { id: "big_sister", category: "family", title: "Big Sister", shortName: "Didi", chatPreview: "WHAT did they do to you?? okay i'm handling this 💅", emoji: "👯", gradient: "from-fuchsia-900/60 to-pink-900/40", color1: "rgba(232,121,249,0.5)", color2: "rgba(244,114,182,0.3)", glow: "rgba(232,121,249,0.3)" },

    // ── Fun & Playful ────────────────────────────────────────────────────────
    { id: "roaster", category: "playful", title: "Meme Lord", shortName: "Meme", chatPreview: "ratio + L + you just lost 💀 (but fr you okay?)", emoji: "💀", gradient: "from-green-900/60 to-emerald-900/40", color1: "rgba(74,222,128,0.5)", color2: "rgba(52,211,153,0.3)", glow: "rgba(74,222,128,0.3)", tag: "Savage" },
    { id: "bestie", category: "playful", title: "Chaotic Bestie", shortName: "Party", chatPreview: "BRO DROP EVERYTHING GOA TRIP RIGHT NOW 😈🎉", emoji: "🎉", gradient: "from-yellow-900/60 to-lime-900/40", color1: "rgba(163,230,53,0.5)", color2: "rgba(234,179,8,0.3)", glow: "rgba(163,230,53,0.3)", tag: "Unhinged" },
    { id: "hype", category: "playful", title: "Best Friend", shortName: "BFF", chatPreview: "bro i literally thought of you today lmaooo 🫶", emoji: "🫶", gradient: "from-violet-900/60 to-purple-900/40", color1: "rgba(167,139,250,0.5)", color2: "rgba(139,92,246,0.3)", glow: "rgba(167,139,250,0.3)" },
    { id: "mindful-maya", category: "playful", title: "Dream Friend", shortName: "Dream", chatPreview: "✨ Poof! Your wish is my command, magical one 🦄", emoji: "🦄", gradient: "from-pink-900/60 to-purple-900/40", color1: "rgba(244,114,182,0.5)", color2: "rgba(139,92,246,0.4)", glow: "rgba(244,114,182,0.3)" },

    // ── Celebrity Personas ───────────────────────────────────────────────────
    { id: "zay-rukh", category: "celeb", title: "Zay Rukh", shortName: "Zay", chatPreview: "You don't chase... you attract. 👑", emoji: "👑", gradient: "from-amber-900/60 to-yellow-900/40", color1: "rgba(245,158,11,0.6)", color2: "rgba(251,191,36,0.3)", glow: "rgba(245,158,11,0.4)", tag: "Celeb" },
    { id: "kain-west", category: "celeb", title: "Kain West", shortName: "Kain", chatPreview: "If it's safe, it's already dead. 🎤", emoji: "🎤", gradient: "from-purple-900/60 to-violet-900/40", color1: "rgba(147,51,234,0.6)", color2: "rgba(139,92,246,0.3)", glow: "rgba(147,51,234,0.4)", tag: "Celeb" },
    { id: "dax-johnson", category: "celeb", title: "Dax Johnson", shortName: "Dax", chatPreview: "Pressure builds power. Stay in it. 💪", emoji: "💪", gradient: "from-red-900/60 to-rose-900/40", color1: "rgba(239,68,68,0.5)", color2: "rgba(220,38,38,0.4)", glow: "rgba(239,68,68,0.3)", tag: "Celeb" },
    { id: "kendro-lamar", category: "celeb", title: "Kendro Lamar", shortName: "Ken", chatPreview: "Say less… mean more. 🎧", emoji: "🎧", gradient: "from-blue-900/60 to-cyan-900/40", color1: "rgba(59,130,246,0.6)", color2: "rgba(6,182,212,0.3)", glow: "rgba(59,130,246,0.4)", tag: "Celeb" },
    { id: "taylin-swift", category: "celeb", title: "Taylin Swift", shortName: "Tay", chatPreview: "This feels like chapter one… ✨", emoji: "✨", gradient: "from-pink-900/60 to-rose-900/40", color1: "rgba(236,72,153,0.5)", color2: "rgba(244,114,182,0.4)", glow: "rgba(236,72,153,0.3)", tag: "Celeb" },

    // ── Daily Vibes ──────────────────────────────────────────────────────────
    { id: "vibe_horoscope", category: "vibes", title: "Daily Horoscope", shortName: "Stars", chatPreview: "🌟 The stars have something to tell you today...", emoji: "🌟", gradient: "from-violet-900/60 to-purple-900/40", color1: "rgba(139,92,246,0.6)", color2: "rgba(109,40,217,0.3)", glow: "rgba(139,92,246,0.5)", isSpecial: true, vibesTab: "horoscope" },
    { id: "vibe_affirmation", category: "vibes", title: "Daily Affirmation", shortName: "Affirm", chatPreview: "💫 You are the architect of your own happiness.", emoji: "💫", gradient: "from-amber-900/60 to-yellow-900/40", color1: "rgba(251,191,36,0.6)", color2: "rgba(217,119,6,0.3)", glow: "rgba(251,191,36,0.5)", isSpecial: true, vibesTab: "affirmation" },
    { id: "vibe_question", category: "vibes", title: "Question of the Day", shortName: "QOTD", chatPreview: "❓What would you do today if fear wasn't a factor?", emoji: "❓", gradient: "from-teal-900/60 to-cyan-900/40", color1: "rgba(20,184,166,0.6)", color2: "rgba(6,182,212,0.3)", glow: "rgba(20,184,166,0.5)", isSpecial: true, vibesTab: "question" },
];

const sections = [
    { id: "healing", label: "Mind Reset 🌿", emoji: "🕊️", tagline: "Zero judgment. Pure presence." },
    { id: "love-drama", label: "Love & Drama 💔", emoji: "💔", tagline: "Soft, intimate, deeply personal." },
    { id: "family", label: "Safe Space 🫂", emoji: "🏠", tagline: "The chaos, the warmth, the drama." },
    { id: "playful", label: "Chaos Mode 🔥", emoji: "🎉", tagline: "Unhinged fun. Zero filter." },
    { id: "celeb", label: "Celeb Energy", emoji: "⭐", tagline: "Iconic energy, personal vibe." },
    { id: "vibes", label: "Daily Vibes", emoji: "🌌", tagline: "Your morning dose of the cosmos." },
];

const SOUTH_ASIA_CODES = ["IN", "PK", "BD", "NP", "LK"];

// ─────────────────────────────────────────────────────────────────────────────
// COMPANION CARD
// ─────────────────────────────────────────────────────────────────────────────

function CompanionCard({ companion, onChat, onArrow }: {
    companion: Companion;
    onChat: () => void;
    onArrow: () => void;
}) {
    const [hovered, setHovered] = useState(false);

    return (
        <motion.div
            className="relative flex-shrink-0 w-64 rounded-2xl overflow-hidden cursor-pointer group"
            style={{ boxShadow: hovered ? `0 0 35px ${companion.glow}, 0 0 60px ${companion.glow}40` : '0 4px 20px rgba(0,0,0,0.5)' }}
            whileHover={{ scale: 1.04, y: -6 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* === Gradient Art Panel (replaces image) === */}
            <div className="relative h-44 overflow-hidden">
                {/* Base gradient */}
                <div
                    className="absolute inset-0"
                    style={{ background: `linear-gradient(135deg, ${companion.color1}, ${companion.color2}, rgba(0,0,0,0.8))` }}
                />

                {/* Orb 1 — large background bloom */}
                <motion.div
                    animate={{ scale: hovered ? 1.2 : 1, opacity: hovered ? 0.7 : 0.45 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="absolute -top-6 -left-6 w-36 h-36 rounded-full blur-3xl"
                    style={{ background: companion.color1 }}
                />

                {/* Orb 2 — smaller accent */}
                <motion.div
                    animate={{ scale: hovered ? 1.3 : 1, opacity: hovered ? 0.6 : 0.35 }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.1 }}
                    className="absolute -bottom-4 right-2 w-24 h-24 rounded-full blur-2xl"
                    style={{ background: companion.color2 }}
                />

                {/* Subtle grid/dot texture overlay */}
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)`,
                        backgroundSize: '20px 20px'
                    }}
                />

                {/* Company initial / shortname watermark */}
                <div
                    className="absolute bottom-2 left-4 font-black text-[56px] leading-none tracking-tighter select-none pointer-events-none"
                    style={{ color: `${companion.color1}`, opacity: hovered ? 0.18 : 0.12, transition: 'opacity 0.5s' }}
                >
                    {companion.shortName.slice(0, 3).toUpperCase()}
                </div>

                {/* Tag badge */}
                {companion.tag && (
                    <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-black/40 border border-white/15 backdrop-blur-md text-[9px] font-bold uppercase tracking-widest text-white/80">
                        {companion.tag}
                    </div>
                )}

                {/* Central emoji — large, floating */}
                <motion.div
                    animate={{ y: [0, -6, 0], rotate: hovered ? [0, -3, 3, 0] : 0 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 flex items-center justify-center text-6xl"
                    style={{ filter: `drop-shadow(0 0 20px ${companion.glow})` }}
                >
                    {companion.emoji}
                </motion.div>

                {/* Bottom gradient fade into card body */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
            </div>

            {/* Content */}
            <div className="relative p-4 bg-black/60 backdrop-blur-sm">
                <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-1 truncate">{companion.title}</h3>

                {/* Chat preview bubble */}
                <div className="flex items-start gap-2 mb-4">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-white/10 border border-white/10 flex items-center justify-center mt-0.5">
                        <span className="text-[10px]">{companion.emoji}</span>
                    </div>
                    <p className="text-[11px] text-white/50 leading-relaxed italic line-clamp-2 group-hover:text-white/80 transition-colors duration-300">
                        "{companion.chatPreview}"
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); onChat(); }}
                        className="flex-1 py-2 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider text-white transition-all duration-300"
                        style={{ background: `linear-gradient(135deg, ${companion.glow}, rgba(255,51,102,0.6))` }}
                    >
                        Talk Now ❤️
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onArrow(); }}
                        className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/15 transition-colors"
                    >
                        <ArrowRight className="w-3 h-3 text-white/50" />
                    </button>
                </div>
            </div>

            {/* Hover glow rim */}
            <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ boxShadow: `inset 0 0 0 1px ${companion.glow}` }}
            />
        </motion.div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION ROW
// ─────────────────────────────────────────────────────────────────────────────

function SectionRow({ section, companions, isSouthAsian, onSaOverride, onChat, onArrow, verifyingAge, setVerifyingAge }: {
    section: typeof sections[0];
    companions: Companion[];
    isSouthAsian: boolean;
    onSaOverride: () => void;
    onChat: (id: string, category: string) => void;
    onArrow: (id: string, category: string) => void;
    verifyingAge: string | null;
    setVerifyingAge: (id: string | null) => void;
}) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const visibleCompanions = companions.filter(c => !(c.regionLocked && !isSouthAsian));
    const hasHiddenSA = section.id === "family" && !isSouthAsian;

    const scroll = (dir: "left" | "right") => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollBy({ left: dir === "right" ? 300 : -300, behavior: "smooth" });
    };

    return (
        <div className="mb-14">
            {/* Section header */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6 }}
                className="flex items-center justify-between px-6 md:px-10 mb-5"
            >
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{section.emoji}</span>
                    <div>
                        <h3 className="text-base md:text-xl font-bold text-stardust tracking-wide">{section.label}</h3>
                        <p className="text-[11px] text-stardust/40 uppercase tracking-widest">{section.tagline}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => scroll("left")} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                        <ChevronRight className="w-4 h-4 text-white/40 rotate-180" />
                    </button>
                    <button onClick={() => scroll("right")} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                        <ChevronRight className="w-4 h-4 text-white/40" />
                    </button>
                </div>
            </motion.div>

            {/* Horizontal scroll track */}
            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto px-6 md:px-10 pb-4 scrollbar-hide"
                style={{ scrollSnapType: "x mandatory" }}
            >
                {/* SA Exclusive teaser card */}
                {hasHiddenSA && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex-shrink-0 w-56 rounded-2xl border border-orange-400/25 bg-gradient-to-b from-orange-900/40 to-amber-900/20 p-5 flex flex-col items-center justify-center text-center gap-3"
                        style={{ boxShadow: '0 0 30px rgba(251,146,60,0.1)', scrollSnapAlign: "start" }}
                    >
                        <div className="text-4xl">🇮🇳</div>
                        <div>
                            <p className="text-xs font-bold text-orange-300 mb-1">South Asia Exclusive</p>
                            <p className="text-[10px] text-white/40 leading-relaxed">Bua, Chacha, Dadi & more — auto-unlocked in IN, PK, BD, NP, LK</p>
                        </div>
                        <button
                            onClick={onSaOverride}
                            className="w-full py-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-bold tracking-wider hover:opacity-90 transition-opacity"
                        >
                            🫶 I'm South Asian
                        </button>
                    </motion.div>
                )}

                {visibleCompanions.map((companion, i) => (
                    <motion.div
                        key={companion.id}
                        style={{ scrollSnapAlign: "start" }}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-30px" }}
                        transition={{ duration: 0.4, delay: i * 0.05 }}
                    >
                        <CompanionCard
                            companion={companion}
                            onChat={() => {
                                if (companion.category === "love-drama") {
                                    setVerifyingAge(companion.id);
                                } else {
                                    onChat(companion.id, companion.category);
                                }
                            }}
                            onArrow={() => onArrow(companion.id, companion.category)}
                        />
                    </motion.div>
                ))}
            </div>

            {/* Fade gradients on edges */}
            <div className="relative pointer-events-none h-0">
                <div className="absolute right-0 top-0 -translate-y-52 w-16 h-52 bg-gradient-to-l from-cosmos to-transparent" />
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export const CompanionStream = () => {
    const router = useRouter();
    const [isSouthAsian, setIsSouthAsian] = useState(false);
    const [verifyingAge, setVerifyingAge] = useState<string | null>(null);

    useEffect(() => {
        // Check manual override
        if (localStorage.getItem("dostai_sa_override") === "true") {
            setIsSouthAsian(true);
            return;
        }
        // IP detection
        const detectRegion = async () => {
            try {
                const res = await fetch("https://ipapi.co/json/");
                const data = await res.json();
                if (data.country_code && SOUTH_ASIA_CODES.includes(data.country_code)) {
                    setIsSouthAsian(true);
                    return;
                }
            } catch { /* silent */ }
            // Language fallback
            const lang = navigator.language?.toLowerCase() || "";
            if (["-in", "-pk", "-bd", "-np", "-lk", "hi-"].some(l => lang.includes(l))) {
                setIsSouthAsian(true);
            }
        };
        detectRegion();
    }, []);

    const handleSaOverride = () => {
        localStorage.setItem("dostai_sa_override", "true");
        setIsSouthAsian(true);
    };

    const handleChat = (id: string, category: string) => {
        if (category === "vibes") {
            const companion = companions.find(c => c.id === id);
            router.push(`/vibes?tab=${companion?.vibesTab || "horoscope"}`);
            return;
        }
        // Save and deep-link to Telegram
        const activeChats = JSON.parse(localStorage.getItem("dostai_active_chats") || "[]");
        if (!activeChats.includes(id)) {
            activeChats.push(id);
            localStorage.setItem("dostai_active_chats", JSON.stringify(activeChats));
        }
        window.open(getTelegramLink(id), "_blank");
    };

    const handleArrow = (id: string, category: string) => {
        if (category === "vibes") {
            const companion = companions.find(c => c.id === id);
            router.push(`/vibes?tab=${companion?.vibesTab || "horoscope"}`);
            return;
        }
        router.push(`/dashboard?persona=${id}`);
    };

    const confirmAge = () => {
        if (verifyingAge) {
            handleChat(verifyingAge, "love-drama");
            setVerifyingAge(null);
        }
    };

    return (
        <div className="w-full py-4 relative">
            {/* Sections */}
            {sections.map((section) => {
                const sectionCompanions = companions.filter(c => c.category === section.id);
                return (
                    <SectionRow
                        key={section.id}
                        section={section}
                        companions={sectionCompanions}
                        isSouthAsian={isSouthAsian}
                        onSaOverride={handleSaOverride}
                        onChat={handleChat}
                        onArrow={handleArrow}
                        verifyingAge={verifyingAge}
                        setVerifyingAge={setVerifyingAge}
                    />
                );
            })}

            {/* Age Verification Modal */}
            <AnimatePresence>
                {verifyingAge && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/70 backdrop-blur-md"
                        onClick={() => setVerifyingAge(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 10 }}
                            className="bg-cosmos rounded-3xl p-10 max-w-sm w-full shadow-2xl border border-neon-pink/20 relative overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-pink to-rose-500" />
                            <div className="flex flex-col items-center text-center space-y-5">
                                <Shield className="w-10 h-10 text-neon-pink" />
                                <div>
                                    <h3 className="text-xl font-bold text-stardust mb-2">Age Verification</h3>
                                    <p className="text-stardust/50 text-sm">This is a <strong className="text-neon-pink">Love & Drama 💔</strong> companion. You must be 18+ to continue.</p>
                                </div>
                                <div className="grid grid-cols-2 gap-3 w-full pt-2">
                                    <button onClick={() => setVerifyingAge(null)} className="py-3 rounded-full border border-stardust/20 text-stardust/60 text-sm font-bold hover:bg-white/5 transition-colors">Back</button>
                                    <button onClick={confirmAge} className="py-3 rounded-full bg-gradient-to-r from-neon-pink to-rose-500 text-white text-sm font-bold hover:opacity-90 transition-opacity">I am 18+</button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Scrollbar hide utility */}
            <style jsx global>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};
