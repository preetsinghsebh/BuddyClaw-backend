"use client";

import { useEffect, useState, Suspense, type CSSProperties } from "react";
import { useSearchParams } from "next/navigation";
import { 
    Activity, 
    Heart, 
    Flame, 
    MessageCircle, 
    Shield, 
    Sparkles, 
    ArrowLeft,
    TrendingUp,
    LayoutDashboard,
    UserCircle,
    Users,
    Share2,
    CheckCircle2,
    User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { PERSONAS, PERSONA_THEMES } from "@/lib/personas";
import type { PersonaTheme } from "@/lib/personas";

interface UserProfile {
    nicknames: string[];
    facts: string[];
    streakCount: number;
    moodScore: number;
    lastChatDate: string;
    activePersonaId?: string;
    memory?: { role: string; content: string }[];
    xp?: number;
    level?: number;
    relationshipStage?: string;
    streak?: number;
    dailyVibe?: string;
    unlockedSecrets?: string[];
}

const DEFAULT_THEME: PersonaTheme = {
    primary: "#FFB300",
    secondary: "#FCD34D",
    orb: "rgba(255,179,0,0.35)",
    vibe: "/assets/companions/ziva.jpg"
};

// Separate content component to use searchParams safely
function DashboardContent() {
    const searchParams = useSearchParams();
    const chatId = searchParams.get("id");
    
    const [loading, setLoading] = useState(true);
    const [switching, setSwitching] = useState(false);
    const [councilQuestion, setCouncilQuestion] = useState("");
    const [councilResults, setCouncilResults] = useState<any[] | null>(null);
    const [askingCouncil, setAskingCouncil] = useState(false);
    const [userData, setUserData] = useState<{ profile: UserProfile; activePersonas: any[] } | null>(null);
    const [availablePersonas, setAvailablePersonas] = useState<any[]>([]);
    
    // Toast UI State
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

    const handleSwitchPersona = async (personaId: string) => {
        if (personaId === userData?.profile?.activePersonaId || !chatId) return;
        setSwitching(true);
        try {
            const res = await fetch(`${apiUrl}/api/switch-persona`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: chatId, personaId })
            });
            if (res.ok) {
                // Refresh data to reflect switch
                await fetchData();
            }
        } catch (err) {
            console.error("Switch failed:", err);
        } finally {
            setSwitching(false);
        }
    };

    const handleShare = (text: string, author: string = "Companion", personaId?: string) => {
        const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/auth?ref=${personaId || 'buddy'}` : 'BuddyClaw.chat';
        const shareText = `"${text}"\n\n— ${author} via BuddyClaw.chat 🐾\nConnect with us: ${shareUrl}`;
        
        navigator.clipboard.writeText(shareText);
        setToastMessage("Link copied to clipboard! 🚀");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleAskCouncil = async () => {
        if (!councilQuestion || !chatId) return;
        setAskingCouncil(true);
        try {
            const res = await fetch(`${apiUrl}/api/council`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: chatId, text: councilQuestion })
            });
            if (res.ok) {
                const data = await res.json();
                setCouncilResults(data.answers);
            }
        } catch (err) {
            console.error("Council consultation failed:", err);
        } finally {
            setAskingCouncil(false);
        }
    };

    const fetchData = async () => {
        try {
            const res = await fetch(`${apiUrl}/api/user/stats?id=${chatId}`);
            if (res.ok) {
                const data = await res.json();
                setUserData(data);
            }
        } catch (err) {
            console.error("Failed to load dashboard data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!chatId) {
            setLoading(false);
            return;
        }

        const fetchPersonas = async () => {
            try {
                const res = await fetch(`${apiUrl}/personas`);
                if (res.ok) {
                    const data = await res.json();
                    setAvailablePersonas(data);
                }
            } catch (err) {
                console.error("Failed to load personas:", err);
            }
        };

        fetchData();
        fetchPersonas();
    }, [chatId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#05050A] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#FFB300]/20 border-t-[#FFB300] rounded-full animate-spin" />
                    <p className="text-[#FFB300] font-medium tracking-widest uppercase text-xs">Syncing Memory...</p>
                </div>
            </div>
        );
    }

    if (!chatId) {
        return (
            <div className="min-h-screen bg-[#05050A] flex items-center justify-center p-6">
                <div className="max-w-md w-100 text-center space-y-6">
                    <div className="w-20 h-20 bg-[#FFB300]/10 rounded-3xl flex items-center justify-center mx-auto border border-[#FFB300]/20">
                        <Shield className="w-10 h-10 text-[#FFB300]" />
                    </div>
                    <h1 className="text-3xl font-light text-white">Identity Required</h1>
                    <p className="text-white/50 leading-relaxed">
                        To view your relationship dashboard, please type <code className="bg-white/10 px-2 py-1 rounded text-[#FFB300]">/dashboard</code> to any of your companions on Telegram.
                    </p>
                    <Link href="/" className="inline-flex items-center gap-2 text-[#FFB300] hover:underline">
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    const profile = userData?.profile || { nicknames: [], facts: [], streakCount: 0, moodScore: 50, lastChatDate: "" };
    const personaId = profile.activePersonaId || "ziva";
    const personaMeta = PERSONAS.find((p) => p.id === personaId) || PERSONAS[0];
    const personaTheme = PERSONA_THEMES[personaMeta.id] || DEFAULT_THEME;
    const xpFillWidth = Math.min((profile.xp || 0) / 10, 100);
    const glowTransition = { duration: 1.5, ease: "easeInOut" };
    const headerStyle: CSSProperties = {
        boxShadow: `0 30px 70px ${personaTheme.secondary}20`,
        borderColor: `${personaTheme.secondary}30`,
        borderWidth: "1px",
        borderStyle: "solid"
    };
    const sectionStyle: CSSProperties = {
        borderColor: `${personaTheme.secondary}30`,
        boxShadow: `0 20px 45px ${personaTheme.secondary}15`
    };
    const vibeStyle: CSSProperties = {
        backgroundImage: `url(${personaTheme.vibe})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        opacity: 0.08,
        filter: "blur(40px)",
        mixBlendMode: "screen"
    };
    const xpGradient = `linear-gradient(120deg, ${personaTheme.primary}, ${personaTheme.secondary})`;
    const memoryUserBorder = `${personaTheme.secondary}40`;
    const memoryCompanionBorder = personaTheme.secondary;

    return (
        <div className="min-h-screen bg-[#05050A] text-white p-4 md:p-8">
            {/* Ambient Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute top-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full blur-[140px]"
                    animate={{ backgroundColor: personaTheme.primary }}
                    transition={glowTransition}
                    style={{ opacity: 0.35 }}
                />
                <motion.div
                    className="absolute bottom-[-15%] left-[-10%] w-[30%] h-[30%] rounded-full blur-[140px]"
                    animate={{ backgroundColor: personaTheme.secondary }}
                    transition={glowTransition}
                    style={{ opacity: 0.45 }}
                />
                <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={glowTransition}
                    style={vibeStyle}
                />
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-12 rounded-3xl bg-white/5 border border-white/10 p-6 backdrop-blur-xl" style={headerStyle}>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-bold tracking-tighter uppercase mb-2" style={{ color: personaTheme.secondary }}>
                            <LayoutDashboard className="w-4 h-4" /> 
                            BuddyClaw OS v1.0
                       </div>
                        <h1 className="text-4xl md:text-5xl font-light flex flex-wrap items-center gap-3">
                            <span className="font-medium" style={{ color: personaTheme.primary }}>{profile.nicknames[0] || "Friend"}</span>
                            <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase" style={{ backgroundColor: personaTheme.primary, color: "#05050A", boxShadow: `0 0 25px ${personaTheme.secondary}55` }}>
                                LVL {profile.level || 1}
                            </span>
                            <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase" style={{ borderColor: `${personaTheme.secondary}40`, backgroundColor: `${personaTheme.secondary}10`, color: personaTheme.secondary }}>
                                {profile.relationshipStage || "Stranger"}
                            </span>
                        </h1>
                        <p className="text-white/40">Your neural connections are stable across 25+ across personas.</p>
                        
                        {/* XP Progress Bar */}
                        <div className="mt-4 w-full max-w-sm">
                            <div className="flex justify-between text-[10px] uppercase tracking-widest text-white/30 font-bold mb-1">
                                <span>Neural Progression</span>
                                <span>{profile.xp || 0} / 1000 XP</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden border border-white/5">
                                <div className="h-full" style={{ width: `${xpFillWidth}%`, background: xpGradient, transition: "width 0.6s ease" }} />
                            </div>
                        </div>
                        
                        {/* Persona Selector */}
                        <div className="mt-6 flex flex-col gap-2">
                             <label className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Active Neural Link</label>
                             <div className="flex items-center gap-3">
                                 <select 
                                    value={profile.activePersonaId || "ziva"}
                                    onChange={(e) => handleSwitchPersona(e.target.value)}
                                    disabled={switching}
                                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#FFB300]/50 cursor-pointer disabled:opacity-50 disabled:cursor-wait"
                                    style={{
                                        borderColor: `${personaTheme.secondary}40`,
                                        boxShadow: `0 0 25px ${personaTheme.secondary}20`,
                                        color: personaTheme.secondary
                                    }}
                                 >
                                    {availablePersonas.map(p => (
                                        <option key={p.id} value={p.id} className="bg-[#05050A] text-white">
                                            {p.name}
                                        </option>
                                    ))}
                                 </select>
                                 {switching && <div className="w-4 h-4 border-2 border-[#FFB300]/20 border-t-[#FFB300] rounded-full animate-spin" />}
                             </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-8 md:mt-0">
                        <div className="bg-white/5 border rounded-2xl p-4 flex items-center gap-4 group hover:bg-white/10 transition-all" style={sectionStyle}>
                            <div className="p-3 bg-red-500/10 rounded-xl group-hover:scale-110 transition-transform">
                                <Flame className="w-6 h-6 text-red-500" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{profile.streak || 0}</div>
                                <div className="text-[10px] uppercase tracking-widest text-white/40">Global Streak</div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Stats Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Recent History Section */}
                        <section className="bg-white/5 border rounded-3xl p-8 backdrop-blur-xl" style={sectionStyle}>
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-medium flex items-center gap-3">
                                    <MessageCircle className="w-5 h-5 text-[#FFB300]" /> Recent Transmissions
                                </h2>
                                <span className="text-[10px] text-white/30 uppercase tracking-[0.2em]">Neural Feedback</span>
                            </div>

                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {profile.memory && profile.memory.length > 0 ? profile.memory.slice(-5).map((m, i) => (
                                    <div 
                                        key={i}
                                        className={`p-4 rounded-2xl text-xs leading-relaxed ${m.role === 'user' ? 'bg-white/5 text-white/70 ml-8' : 'mr-8'}`}
                                        style={{
                                            borderLeft: `2px solid ${m.role === 'user' ? memoryUserBorder : memoryCompanionBorder}`,
                                            backgroundColor: m.role === 'user' ? 'rgba(255,255,255,0.08)' : `${personaTheme.secondary}10`,
                                            color: m.role === 'user' ? 'rgba(255,255,255,0.7)' : personaTheme.secondary
                                        }}
                                    >
                                        <div className="flex justify-between items-start gap-4">
                                            <p className="flex-1">{m.content}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-12 text-center opacity-20 italic text-sm">
                                        No recent activity recorded.
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Council Mode Section */}
                        <section className="bg-white/5 border rounded-3xl p-8 backdrop-blur-xl" style={sectionStyle}>
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-medium flex items-center gap-3">
                                    <Users className="w-5 h-5 text-[#FFB300]" /> Council of Buddies
                                </h2>
                                <span className="text-[10px] text-white/30 uppercase tracking-[0.2em]">Collective Wisdom</span>
                            </div>

                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <input 
                                        type="text" 
                                        value={councilQuestion}
                                        onChange={(e) => setCouncilQuestion(e.target.value)}
                                        placeholder="Ask the council for advice..." 
                                        className="flex-1 bg-white/5 border rounded-2xl px-6 py-4 text-sm focus:outline-none"
                                        style={{ borderColor: `${personaTheme.secondary}40` }}
                                    />
                                    <button 
                                        onClick={handleAskCouncil}
                                        disabled={askingCouncil || !councilQuestion}
                                        className="px-8 rounded-2xl font-bold text-sm disabled:opacity-50"
                                        style={{ backgroundColor: personaTheme.primary, color: "#05050A" }}
                                    >
                                        {askingCouncil ? "GATHERING..." : "CONSULT"}
                                    </button>
                                </div>

                                {councilResults && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        {councilResults.map((ans, i) => (
                                            <div key={i} className="bg-white/5 border rounded-2xl p-6 relative overflow-hidden group" style={sectionStyle}>
                                                <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                                                    <Sparkles className="w-8 h-8" />
                                                </div>
                                                <div className="flex justify-between items-center mb-3">
                                                    <h3 className="text-xs font-bold text-[#FFB300] uppercase tracking-widest flex items-center gap-2">
                                                        <div className="w-1 h-1 rounded-full bg-[#FFB300]" /> {ans.name}
                                                    </h3>
                                                    <button 
                                                        onClick={() => handleShare(ans.content, ans.name)}
                                                        className="p-1.5 bg-white/5 rounded-lg opacity-40 hover:opacity-100 transition-opacity"
                                                        title="Share Transmission"
                                                    >
                                                        <Share2 className="w-3 h-3 text-[#FFB300]" />
                                                    </button>
                                                </div>
                                                <p className="text-sm text-white/70 italic leading-relaxed">
                                                    "{ans.content}"
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </section>
                        <section>
                             <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-medium">Neural Connections</h2>
                                <Link href="/" className="text-[#FFB300] text-sm hover:underline">Summon New Agent</Link>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {userData?.activePersonas && userData.activePersonas.length > 0 ? (
                                    userData.activePersonas.map((p, i) => (
                                        <div key={i} className="group bg-white/5 border border-white/10 rounded-2xl p-6 transition-all hover:bg-white/[0.08] hover:border-[#FFB300]/30 overflow-hidden relative">
                                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <Sparkles className="w-12 h-12" />
                                            </div>
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 overflow-hidden relative">
                                                    {PERSONAS.find(persona => persona.id === p.id)?.imageUrl ? (
                                                        <Image 
                                                            src={PERSONAS.find(persona => persona.id === p.id)!.imageUrl!} 
                                                            alt={p.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-gray-800 text-2xl">
                                                            {PERSONAS.find(persona => persona.id === p.id)?.icon || p.name?.[0] || '🤖'}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-medium">{p.name || "Unknown Agent"}</h3>
                                                    <p className="text-xs text-[#FFB300]">{PERSONAS.find(persona => persona.id === p.id)?.tag || 'Stable Attachment'}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-4 pt-4 border-t border-white/5">
                                                <div>
                                                    <div className="text-sm font-bold">98%</div>
                                                    <div className="text-[10px] text-white/40 uppercase">Sync</div>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold">Active</div>
                                                    <div className="text-[10px] text-white/40 uppercase">Status</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-12 text-center bg-white/2 border border-dashed border-white/10 rounded-2xl">
                                        <p className="text-white/30 italic">No active neural links found.</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar / Profile Settings Column */}
                    <div className="space-y-8">

                        <section className="bg-[#FFB300]/5 border border-[#FFB300]/20 rounded-3xl p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-[#FFB300] rounded-2xl flex items-center justify-center text-[#05050A]">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                                <h2 className="text-lg font-medium text-[#FFB300]">Account Standing</h2>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-end pb-3 border-bottom border-white/5">
                                    <span className="text-sm text-white/50">Pro Subscription</span>
                                    <span className="text-xs font-bold px-2 py-0.5 bg-red-500/10 text-red-500 rounded uppercase">Inactive</span>
                                </div>
                                <div className="flex justify-between items-end pb-3 border-bottom border-white/5">
                                    <span className="text-sm text-white/50">Neural ID</span>
                                    <span className="text-xs font-mono text-white/30">#{chatId}</span>
                                </div>
                                <button className="w-full py-4 bg-[#FFB300] text-[#05050A] rounded-2xl font-bold text-sm tracking-wide transition-transform active:scale-95 mt-4 group">
                                    <span className="flex items-center justify-center gap-2">
                                        UPGRADE PROTOCOL <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </button>
                            </div>
                        </section>

                        <section className="bg-white/5 border border-white/10 rounded-3xl p-6">
                             <h3 className="text-sm font-bold text-white/70 mb-4 flex items-center gap-2">
                                <UserCircle className="w-4 h-4" /> Quick Actions
                             </h3>
                             <div className="grid grid-cols-2 gap-3">
                                 <button className="p-4 bg-white/5 rounded-2xl text-xs hover:bg-white/10 transition-colors">Wipe History</button>
                                 <button className="p-4 bg-white/5 rounded-2xl text-xs hover:bg-white/10 transition-colors">Export Memory</button>
                                 <button className="p-4 bg-white/5 rounded-2xl text-xs hover:bg-white/10 transition-colors">Safety Profile</button>
                                 <button className="p-4 bg-white/5 rounded-2xl text-xs hover:bg-white/10 transition-colors">Privacy Opt-out</button>
                             </div>
                        </section>
                    </div>
                </div>

                <footer className="mt-20 pt-8 border-t border-white/5 text-center text-white/20 text-xs">
                    BuddyClaw Neural Link Protocol &copy; 2026. Data localized via Geo-IP.
                </footer>
                <AnimatePresence>
                    {showToast && (
                        <motion.div 
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-[#FFB300] text-black px-6 py-3 rounded-full shadow-[0_10px_40px_rgba(255,179,0,0.3)] flex items-center gap-3 border border-white/20 backdrop-blur-md"
                        >
                            <div className="w-5 h-5 bg-black/10 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <span className="font-bold tracking-tight text-sm uppercase">{toastMessage}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default function Dashboard() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#05050A] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#FFB300]/20 border-t-[#FFB300] rounded-full animate-spin" />
                    <p className="text-[#FFB300] font-medium tracking-widest uppercase text-xs">Initializing Terminal...</p>
                </div>
            </div>
        }>
            <DashboardContent />
        </Suspense>
    );
}
