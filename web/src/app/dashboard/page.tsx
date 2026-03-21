"use client";

import { useEffect, useState, Suspense } from "react";
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
    UserCircle
} from "lucide-react";
import Link from "next/link";

interface UserProfile {
    nicknames: string[];
    facts: string[];
    streakCount: number;
    moodScore: number;
    lastChatDate: string;
}

// Separate content component to use searchParams safely
function DashboardContent() {
    const searchParams = useSearchParams();
    const chatId = searchParams.get("id");
    
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState<{ profile: UserProfile; activePersonas: any[] } | null>(null);

    useEffect(() => {
        if (!chatId) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
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

        fetchData();
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

    return (
        <div className="min-h-screen bg-[#05050A] text-white p-4 md:p-8">
            {/* Ambient Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#FFB300]/5 blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[#FFB300] text-xs font-bold tracking-tighter uppercase mb-2">
                             <LayoutDashboard className="w-4 h-4" /> 
                             BuddyClaw OS v1.0
                        </div>
                        <h1 className="text-4xl md:text-5xl font-light">
                            Welcome Back, <span className="font-medium text-[#FFB300]">{profile.nicknames[0] || "Friend"}</span>
                        </h1>
                        <p className="text-white/40">Your neural connections are stable across 25+ across personas.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                            <div className="p-3 bg-red-500/10 rounded-xl">
                                <Flame className="w-6 h-6 text-red-500" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{profile.streakCount}</div>
                                <div className="text-[10px] uppercase tracking-widest text-white/40">Global Streak</div>
                            </div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                            <div className="p-3 bg-[#FFB300]/10 rounded-xl">
                                <Heart className="w-6 h-6 text-[#FFB300]" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{profile.moodScore}%</div>
                                <div className="text-[10px] uppercase tracking-widest text-white/40">Avg Affinity</div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Stats Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Memory Section */}
                        <section className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-medium flex items-center gap-3">
                                    <Activity className="w-5 h-5 text-[#FFB300]" /> Core Memory Bank
                                </h2>
                                <span className="text-[10px] text-white/30 uppercase tracking-[0.2em]">Encrypted Storage</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold text-white/30 uppercase tracking-widest">Known Identities</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {profile.nicknames.length > 0 ? profile.nicknames.map((n, i) => (
                                            <span key={i} className="px-3 py-1 bg-[#FFB300]/10 border border-[#FFB300]/20 rounded-lg text-[#FFB300] text-sm italic">
                                                "{n}"
                                            </span>
                                        )) : <span className="text-white/20 text-sm">No aliases recorded yet.</span>}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold text-white/30 uppercase tracking-widest">Observed Facts</h3>
                                    <ul className="space-y-2">
                                        {profile.facts.length > 0 ? profile.facts.slice(0, 5).map((f, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm text-white/70">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#FFB300] mt-1.5 shrink-0" />
                                                {f}
                                            </li>
                                        )) : <li className="text-white/20 text-sm italic">Memory empty. Start chatting.</li>}
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* Recent Connections Grid */}
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
                                                <div className="w-16 h-16 rounded-xl bg-blue-500/20 border border-white/10 overflow-hidden">
                                                    {/* Persona avatar placeholder */}
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-800 text-2xl">
                                                        {p.name?.[0] || '🤖'}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-medium">{p.name || "Unknown Agent"}</h3>
                                                    <p className="text-xs text-[#FFB300]">Stable Attachment</p>
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
                                <button className="w-full py-4 bg-[#FFB300] text-[#05050A] rounded-2xl font-bold text-sm tracking-wide transition-transform active:scale-95 mt-4">
                                    UNLOCK PRO FEATURES
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
