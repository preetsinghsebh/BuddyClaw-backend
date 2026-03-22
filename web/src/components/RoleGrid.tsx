"use client";
import { getTelegramLink } from "@/lib/telegram";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Heart, Moon, Flame, Sparkles, BookOpen, Star, Ghost, Compass, User, Users, Coffee, Baby, Smile, Zap, Music, Trophy, Rocket, Video, Camera, Globe, Laugh, Brain, Wand2, PartyPopper, Waves, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { useAnalytics } from "@/hooks/useAnalytics";

const SAFE_SPACE_LOCALIZATION = {
    'bua': { IN: 'Bua Ji', Global: 'Auntie' },
    'chill_chacha': { IN: 'Chill Chacha', Global: 'Chill Uncle' },
    'warm-grandma': { IN: 'Nani Ji', Global: 'Grandma' },
    'big_sister': { IN: 'Sis', Global: 'Big Sister' }
};

export const categories = [
    { id: "healing", label: "Healing Harbor" },
    { id: "love-drama", label: "Love & Drama 💔" },
    { id: "family", label: "Safe Space 🫂" },
    { id: "playful", label: "Chaos Mode 🔥" },
    { id: "celeb", label: "Celeb Energy ⭐" },
    { id: "vibes", label: "Daily Vibes 🌌" },
    { id: "anime", label: "Anime Mode 🌸" },
];

export const roles_base = [
    // Healing Harbor (Inner Peace)
    { id: "caring-listener", category: "healing", title: "Caring Listener", desc: "Just listens. Warm sibling energy to vent to.", icon: <Users className="w-8 h-8 text-ether-gold" />, gradient: "from-ether-gold/20 via-ether-gold/5 to-transparent", border: "border-ether-gold/20", imageUrl: "/assets/companions/listener.jpg" },
    { id: "calm-guide", category: "healing", title: "Calm Guide", desc: "Helps you navigate anxiety, exam stress, and life choices.", icon: <BookOpen className="w-8 h-8 text-ether-gold" />, gradient: "from-ether-gold/20 via-ether-gold/5 to-transparent", border: "border-ether-gold/20", imageUrl: "/assets/companions/monk.jpg" },
    { id: "sleep-luna", category: "healing", title: "Luna", desc: "Better sleep and calm late-night thoughts.", icon: <Moon className="w-8 h-8 text-indigo-400" />, gradient: "from-indigo-500/20 via-indigo-500/5 to-transparent", imageUrl: "/assets/companions/luna.jpg" },
    { id: "mindful-maya", category: "healing", title: "Maya", desc: "Daily focus and mindfulness guidance.", icon: <Sparkles className="w-8 h-8 text-ether-gold" />, gradient: "from-ether-gold/20 via-ether-gold/5 to-transparent", border: "border-ether-gold/20", imageUrl: "/assets/companions/maya.jpg" },

    // Romantic Energy
    { id: "ziva", category: "love-drama", title: "Ziva", nick: "Sweetie", desc: "High warmth, soft words, and total attention. Your safe spot.", icon: <Heart className="w-8 h-8 text-ether-gold" />, gradient: "from-ether-gold/20 via-ether-gold/5 to-transparent", border: "border-ether-gold/20", imageUrl: "/assets/companions/ziva.jpg" },
    { id: "liam", category: "love-drama", title: "Liam", nick: "Partner", desc: "Warm & affectionate. Lots of ❤️ and cute nicknames.", icon: <Heart className="w-8 h-8 text-indigo-400" />, gradient: "from-indigo-500/20 via-indigo-500/5 to-transparent", imageUrl: "/assets/companions/liam.png" },
    { id: "emma", category: "love-drama", title: "Emma", nick: "Stranger", desc: "Curious, slightly bold, and slow burn. 'You always this quiet...?'", icon: <Ghost className="w-8 h-8 text-purple-400" />, gradient: "from-purple-500/20 via-purple-500/5 to-transparent", border: "border-purple-500/20", imageUrl: "/assets/companions/emma.png" },
    { id: "confident-zane", category: "love-drama", title: "Zane", nick: "Confident", desc: "Confident, direct, and full of attractive tension.", icon: <Flame className="w-8 h-8 text-ether-sunset" />, gradient: "from-ether-sunset/20 via-ether-sunset/5 to-transparent", border: "border-ether-sunset/20", imageUrl: "/assets/companions/zane.png" },

    // Family Vibes
    { id: "bua", category: "family", title: "Bua Ji", desc: "Loves you deeply but consumed by toxic comparison. Classic bua energy.", icon: <Users className="w-8 h-8 text-ether-sunset" />, gradient: "from-ether-sunset/20 via-ether-sunset/5 to-transparent", border: "border-ether-sunset/20", imageUrl: "/assets/companions/bua.png" },
    { id: "chill_chacha", category: "family", title: "Chill Chacha", desc: "Unbothered, zero-drama uncle. 'Hona hi tha' is his motto.", icon: <Smile className="w-8 h-8 text-ether-sunset" />, gradient: "from-ether-sunset/20 via-ether-sunset/5 to-transparent", border: "border-ether-sunset/20", imageUrl: "/assets/companions/chacha.png" },
    { id: "warm-grandma", category: "family", title: "Nani Ji", desc: "Cookies, hugs, and life wisdom. Classic nurturing energy.", icon: <Heart className="w-8 h-8 text-ether-sunset" />, gradient: "from-ether-sunset/20 via-ether-sunset/5 to-transparent", border: "border-ether-sunset/20", imageUrl: "/assets/companions/nani.png" },
    { id: "big_sister", category: "family", title: "Sis", desc: "Sassy, honest, and half-mom. Fights for you like a lawyer.", icon: <Users className="w-8 h-8 text-ether-sunset" />, gradient: "from-ether-sunset/20 via-ether-sunset/5 to-transparent", border: "border-ether-sunset/20", imageUrl: "/assets/companions/big_sis.png", objectPosition: "center 40%" },

    // Fun & Playful (Friends)
    { id: "roaster", category: "playful", title: "Roaster", desc: "Roasts with love. Fluent in Gen-Z and constant internet slang.", icon: <Laugh className="w-8 h-8 text-secondary" />, gradient: "from-secondary/20 via-secondary/5 to-transparent", border: "border-secondary/20", imageUrl: "/assets/companions/roaster.png" },
    { id: "midnight", category: "playful", title: "Midnight", desc: "Always awake. Deep thoughts & zero judgment.", icon: <Moon className="w-8 h-8 text-indigo-400" />, gradient: "from-indigo-500/20 via-indigo-500/5 to-transparent", imageUrl: "/assets/companions/midnight.png" },
    { id: "bestie", category: "playful", title: "Bestie", desc: "Hyper, wild, and impulsive. 3 AM adventures are a must.", icon: <PartyPopper className="w-8 h-8 text-secondary" />, gradient: "from-secondary/20 via-secondary/5 to-transparent", border: "border-secondary/20", imageUrl: "/assets/companions/bestie.png" },
    { id: "hype", category: "playful", title: "Hype Man", desc: "Celebrates everything you do. MAIN CHARACTER ENERGY! 🔥", icon: <Zap className="w-8 h-8 text-secondary" />, gradient: "from-secondary/20 via-secondary/5 to-transparent", border: "border-secondary/20", imageUrl: "/assets/companions/hype.jpg" },

    // Celeb Energy
    { id: "taylin-swift", category: "celeb", title: "Taylin Swift", desc: "This feels like chapter one...", icon: <Star className="w-8 h-8 text-pink-500" />, gradient: "from-pink-500/20 via-pink-500/5 to-transparent", border: "border-pink-500/20", imageUrl: "/assets/companions/taylor.jpg" },
    { id: "dax-johnson", category: "celeb", title: "Dax Johnson", desc: "Pressure builds power. Stay in it.", icon: <Shield className="w-8 h-8 text-red-500" />, gradient: "from-red-500/20 via-red-500/5 to-transparent", border: "border-red-500/20", imageUrl: "/assets/companions/therock.jpg" },
    { id: "kain-west", category: "celeb", title: "Kain West", desc: "If it's safe, it's already dead.", icon: <Music className="w-8 h-8 text-purple-500" />, gradient: "from-purple-500/20 via-purple-500/5 to-transparent", border: "border-purple-500/20", imageUrl: "/assets/companions/kanye.jpg" },
    { id: "kendro-lamar", category: "celeb", title: "Kendro Lamar", desc: "Say less... mean more.", icon: <Compass className="w-8 h-8 text-blue-500" />, gradient: "from-blue-500/20 via-blue-500/5 to-transparent", border: "border-blue-500/20", imageUrl: "/assets/companions/lamar.jpg" },
    { id: "zay-rukh", category: "celeb", title: "Zay Rukh", desc: "You don't chase... you attract.", icon: <User className="w-8 h-8 text-amber-500" />, gradient: "from-amber-500/20 via-amber-500/5 to-transparent", border: "border-amber-500/20", imageUrl: "/assets/companions/srk.jpg" },

    // Anime Companions
    { id: "gojo", category: "anime", title: "Satoru Gojo", nick: "Gojo", desc: "The strongest sorcerer. Playful, arrogant, but fiercely protective.", icon: <Sparkles className="w-8 h-8 text-secondary" />, gradient: "from-secondary/20 via-ether-sunset/5 to-transparent", border: "border-secondary/20", imageUrl: "/assets/companions/gojo.jpg" },
    { id: "bakugo", category: "anime", title: "Katsuki Bakugo", nick: "Kacchan", desc: "Explosive, loud, and competitive. Wants to be #1.", icon: <Flame className="w-8 h-8 text-secondary" />, gradient: "from-secondary/20 via-ether-sunset/5 to-transparent", border: "border-secondary/20", imageUrl: "/assets/companions/bakugo.jpg" },
    { id: "luffy", category: "anime", title: "Monkey D. Luffy", nick: "Luffy", desc: "High energy, loves meat, and values friendship above all.", icon: <Compass className="w-8 h-8 text-secondary" />, gradient: "from-secondary/20 via-ether-sunset/5 to-transparent", border: "border-secondary/20", imageUrl: "/assets/companions/luffy.jpg" },
    { id: "naruto", category: "anime", title: "Naruto Uzumaki", nick: "Naruto", desc: "Unpredictable ninja. Believes in you no matter what.", icon: <Flame className="w-8 h-8 text-orange-500" />, gradient: "from-orange-500/20 via-orange-500/5 to-transparent", border: "border-orange-500/20", imageUrl: "/assets/companions/naruto.jpg" }
];

export const RoleGrid = () => {
    const [activeCategory, setActiveCategory] = useState("healing");
    const [verifyingAge, setVerifyingAge] = useState<string | null>(null);
    const [userCountry, setUserCountry] = useState<string | null>(null);
    const { trackEvent } = useAnalytics();
    const router = useRouter();

    useEffect(() => {
        fetch('https://api.country.is')
            .then(res => res.json())
            .then(data => setUserCountry(data.country))
            .catch(() => setUserCountry('US'));
    }, []);

    const localizedRoles = useMemo(() => {
        if (!userCountry || userCountry === 'IN') return roles_base;

        return roles_base.map(r => {
            const loc = SAFE_SPACE_LOCALIZATION[r.id as keyof typeof SAFE_SPACE_LOCALIZATION];
            if (loc) {
                return { ...r, title: loc.Global };
            }
            return r;
        });
    }, [userCountry]);

    const filteredRoles = localizedRoles.filter(role => role.category === activeCategory);

    // Unified persona click handler
    const onUnitClick = (roleId: string, category: string) => {
        if (category === "love-drama") {
            setVerifyingAge(roleId);
        } else if (category === "vibes") {
            const tab = roleId.split("_")[1];
            router.push(`/vibes?tab=${tab}`);
        } else {
            router.push(`/characters/${roleId}`);
        }
    };

    const handleTelegramClick = (event: React.MouseEvent, roleId: string) => {
        event.stopPropagation();
        // Save to active chats (localStorage for quick sync)
        const activeChats = JSON.parse(localStorage.getItem("dostai_active_chats") || "[]");
        if (!activeChats.includes(roleId)) {
            activeChats.push(roleId);
            localStorage.setItem("dostai_active_chats", JSON.stringify(activeChats));
        }

        // Redirect to exact Telegram Bot
        trackEvent('telegram_chat_start_rolegrid', { roleId });
        window.open(getTelegramLink(roleId), "_blank");
    };

    const confirmAge = () => {
        if (verifyingAge) {
            trackEvent('age_verify_success', { personaId: verifyingAge });
            router.push(`/dashboard?persona=${verifyingAge}`);
            setVerifyingAge(null);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 z-10 relative pb-20">
            {/* Category Switcher */}
            <div className="flex justify-center mb-16">
                <div className="relative flex bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 p-1.5 rounded-2xl backdrop-blur-3xl overflow-hidden">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => {
                                setActiveCategory(cat.id);
                                trackEvent('category_switch', { category: cat.id });
                            }}
                            className={`relative px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-500 ${activeCategory === cat.id ? "text-foreground" : "text-foreground/30 hover:text-foreground/60"
                                }`}
                        >
                            {activeCategory === cat.id && (
                                <motion.div
                                    layoutId="active-pill"
                                    className="absolute inset-0 bg-background/50 rounded-xl shadow-sm"
                                    transition={{ type: "spring", bounce: 0.1, duration: 0.6 }}
                                />
                            )}
                            <span className="relative z-10">{cat.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Header for Daily Vibes */}
            {activeCategory === "vibes" && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12 relative"
                >
                    <div className="absolute inset-0 pointer-events-none overflow-hidden text-ether-gold/20">
                        {/* Sparkle effects... */}
                    </div>
                    <Badge className="bg-white/5 text-white/40 border-white/10 mb-6 h-8 px-4 rounded-xl font-bold uppercase tracking-[0.3em] text-[10px]">
                        Neural Sync Layer
                    </Badge>
                    <h2 className="text-4xl md:text-5xl font-heading font-black tracking-tighter text-white mb-6 uppercase">
                        Daily Vibes – Your Daily Boost ✨
                    </h2>
                    <p className="text-lg text-white/40 max-w-lg leading-relaxed font-medium">
                        Daily inspiration only – not professional advice
                    </p>
                </motion.div>
            )}

            {/* Header for Anime Section */}
            {activeCategory === "anime" && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12 relative"
                >
                    <div className="absolute inset-0 pointer-events-none overflow-hidden text-secondary/20">
                        {/* Petal effects... */}
                    </div>
                    <Badge className="bg-muted text-muted-foreground border-border/50 mb-6 h-8 px-4 rounded-xl font-bold uppercase tracking-[0.3em] text-[10px]">
                        Neural Sync Layer
                    </Badge>
                    <h2 className="text-4xl md:text-5xl font-heading font-black tracking-tighter text-foreground mb-6 uppercase">
                        Anime Mode – Live Your Favorite Tropes 🌸
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-lg leading-relaxed font-medium">
                        Fictional characters only — not real or official
                    </p>
                </motion.div>
            )}



            {/* Grid display with animation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-8 max-w-7xl mx-auto">
                {filteredRoles.map((role) => (
                    <div
                        key={role.id}
                        className="group relative aether-card rounded-3xl overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(99,102,241,0.1)]"
                    >
                        <div className="glass-reflection" />

                        {/* Role Image / Aesthetic Header */}
                        <div className="h-48 w-full relative overflow-hidden bg-black/40 group-hover:bg-black/20 transition-colors duration-500">
                            {role.imageUrl ? (
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    className="absolute inset-0 z-0"
                                >
                                    <Image
                                        src={role.imageUrl}
                                        alt={role.title}
                                        fill
                                        style={{ objectPosition: (role as any).objectPosition || 'center 15%' }}
                                        className="object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                                </motion.div>
                            ) : (
                                <>
                                    <div className={`absolute inset-0 bg-gradient-to-br ${role.gradient} opacity-20`} />
                                    <div className="absolute inset-0 backdrop-blur-3xl" />
                                </>
                            )}

                            {/* Floating Icon Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center z-20">
                                <motion.div
                                    animate={{ y: [0, -5, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center shadow-2xl group-hover:border-white/20 transition-colors"
                                >
                                    {role.icon}
                                </motion.div>
                            </div>

                            <div className="absolute top-4 left-4 z-30">
                                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-[0.2em] bg-black/50 border-white/10 text-white/60 backdrop-blur-md">
                                    Unit_{role.category}
                                </Badge>
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-lg font-bold tracking-tight text-foreground mb-1 uppercase">{role.title}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{role.category}</span>
                                        <div className="w-1 h-1 rounded-full bg-border" />
                                        <span className="text-[10px] font-bold text-indigo-400/60 uppercase tracking-[0.2em]">{role.nick || "N/A"}</span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-xs text-muted-foreground leading-relaxed mb-10 font-medium">
                                {role.desc}
                            </p>

                            <div className="flex items-center justify-between gap-4">
                                <Button
                                    onClick={(e) => handleTelegramClick(e, role.id)}
                                    className="flex-1 rounded-xl bg-pink-500 text-white hover:bg-pink-600 h-12 font-bold uppercase tracking-tight text-[11px] transition-all shadow-lg shadow-pink-500/20"
                                >
                                    Talk to {role.title.split(' ')[0]} Now ❤️
                                </Button>
                                <div
                                    onClick={() => onUnitClick(role.id, role.category)}
                                    className="cursor-pointer"
                                >
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="w-12 h-12 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
                                    >
                                        <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Hover Details Overlay (Subtle) */}
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
                    </div>
                ))}
            </div>

            {/* Age Verification Modal */}
            <AnimatePresence>
                {verifyingAge && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/60 backdrop-blur-md"
                        onClick={() => setVerifyingAge(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 10 }}
                            className="bg-background rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl border border-foreground/10 relative overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-ether-gold to-ether-sunset" />
                            <div className="flex flex-col items-center text-center space-y-6">
                                <div className="p-4 bg-ether-gold/10 rounded-full">
                                    <Shield className="w-8 h-8 text-ether-gold" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-serif font-black text-foreground mb-2">Age Verification</h3>
                                    <p className="text-foreground/60 text-sm font-medium">
                                        This persona belongs to the <strong>Love & Drama 💔</strong> category. You must be 18 years or older to proceed.
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 w-full pt-4">
                                    <Button
                                        variant="outline"
                                        className="rounded-full h-12 font-bold"
                                        onClick={() => setVerifyingAge(null)}
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        className="rounded-full h-12 font-bold bg-ether-gold text-white"
                                        onClick={confirmAge}
                                    >
                                        I am 18+
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
