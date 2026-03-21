"use client";

import { useState, Suspense, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, Loader2, Mail, Phone, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PERSONAS } from "@/lib/personas";
import { getTelegramLink } from "@/lib/telegram";
import { supabase } from "@/lib/supabase";

function AuthForm() {
    const searchParams = useSearchParams();
    const personaId = searchParams.get("personaId");
    const persona = PERSONAS.find(p => p.id.toLowerCase() === personaId?.toLowerCase());

    const [method, setMethod] = useState<"phone" | "email">("phone");
    const [step, setStep] = useState<"identifier" | "otp">("identifier");
    const [identifier, setIdentifier] = useState("");
    const [otp, setOtp] = useState("");
    const [is18Plus, setIs18Plus] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Check for existing session on mount
    useEffect(() => {
        // Persist personaId to localStorage if present in URL
        if (personaId) {
            localStorage.setItem("pendingPersonaId", personaId);
        }

        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                // Use personaId from URL or fallback to localStorage
                const effectivePersonaId = personaId || localStorage.getItem("pendingPersonaId");
                
                if (effectivePersonaId) {
                    localStorage.removeItem("pendingPersonaId"); // Clean up
                    window.location.href = getTelegramLink(effectivePersonaId);
                } else {
                    router.push("/customize");
                }
            }
        };
        checkSession();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                const effectivePersonaId = personaId || localStorage.getItem("pendingPersonaId");
                
                if (effectivePersonaId) {
                    localStorage.removeItem("pendingPersonaId"); // Clean up
                    window.location.href = getTelegramLink(effectivePersonaId);
                } else {
                    router.push("/customize");
                }
            }
        });

        return () => subscription.unsubscribe();
    }, [personaId, router]);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!is18Plus) return;
        setLoading(true);
        setError(null);

        try {
            let formattedIdentifier = identifier;
            if (method === 'phone' && !identifier.startsWith('+')) {
                // Default to +91 if no country code provided, or just prepend + if it looks like a full number
                // For now, let's just prepend + for basic robustness
                formattedIdentifier = identifier.startsWith('91') ? `+${identifier}` : `+91${identifier}`;
            }

            const { error: otpError } = await supabase.auth.signInWithOtp(
                method === 'email' 
                    ? { 
                        email: formattedIdentifier,
                        options: {
                            emailRedirectTo: window.location.href
                        }
                    } 
                    : { phone: formattedIdentifier }
            );

            if (otpError) throw otpError;
            setStep("otp");
        } catch (err: any) {
            setError(err.message || "Failed to send OTP. Please try again.");
            console.error("Auth error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error: verifyError } = await supabase.auth.verifyOtp(
                method === 'email'
                    ? { email: identifier, token: otp, type: 'email' }
                    : { phone: identifier, token: otp, type: 'sms' }
            );

            if (verifyError) throw verifyError;
            
            // Redirect happens via onAuthStateChange listener
        } catch (err: any) {
            setError(err.message || "Invalid OTP. Please try again.");
            console.error("Verify error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md bubble-card p-8 rounded-3xl relative overflow-visible"
        >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[hsl(var(--accent-pink))] to-[hsl(var(--accent-purple))]" />

            <div className="text-center mb-8">
                <h1 className="text-3xl font-anton text-white mb-2 tracking-wider">
                    {persona ? `Join DostAI to chat with ${persona.name}` : "Join DostAI"}
                </h1>
                <p className="text-gray-400 font-inter text-sm">
                    {persona 
                        ? `Sign up for free unlimited chats with ${persona.name}. Your 2am companion is waiting.`
                        : "Your 2am companion is waiting for you. Sign in or create an account to continue."}
                </p>
            </div>

            {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium animate-shake">
                    {error}
                </div>
            )}

            <AnimatePresence mode="wait">
                {step === "identifier" ? (
                    <motion.form
                        key="identifier-form"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                        onSubmit={handleSendOtp}
                        className="space-y-6"
                    >
                        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                            <button
                                type="button"
                                onClick={() => setMethod("phone")}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${method === "phone" ? "bg-white/10 shadow-sm text-white" : "text-gray-500 hover:text-white"}`}
                            >
                                <Phone className="w-4 h-4" /> Phone
                            </button>
                            <button
                                type="button"
                                onClick={() => setMethod("email")}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${method === "email" ? "bg-white/10 shadow-sm text-white" : "text-gray-500 hover:text-white"}`}
                            >
                                <Mail className="w-4 h-4" /> Email
                            </button>
                        </div>

                        <div className="space-y-2 group relative">
                            <Label htmlFor="identifier" className="text-gray-300 font-inter">
                                {method === "phone" ? "Mobile Number" : "Email Address"}
                            </Label>
                            <div className="relative">
                                <Input
                                    id="identifier"
                                    type={method === "phone" ? "tel" : "email"}
                                    placeholder={method === "phone" ? "+91 99999 99999" : "you@example.com"}
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    required
                                    className="h-12 pl-4 pr-10 rounded-xl bg-black border-white/20 focus:ring-[hsl(var(--accent-pink))] focus:border-[hsl(var(--accent-pink))] transition-all text-lg text-white"
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
                                    {method === "phone" ? <Phone className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3 pt-2">
                             <Checkbox
                                 id="age-gate"
                                 checked={is18Plus}
                                 onCheckedChange={(c: boolean | 'indeterminate') => setIs18Plus(c === true)}
                                 className="mt-1 size-5 border-2 data-[state=checked]:bg-white data-[state=checked]:text-black data-[state=checked]:border-white"
                                 style={{ border: '2px solid white', backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                             />
                            <div className="grid leading-none gap-1.5">
                                <Label htmlFor="age-gate" className="text-sm font-medium leading-tight text-gray-300 cursor-pointer font-inter">
                                    I confirm I am 18 years or older.
                                </Label>
                                <p className="text-xs text-gray-500 font-inter">
                                    This platform provides emotional companionship strictly for adults. By proceeding, you agree to our Terms of Service.
                                </p>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={!is18Plus || identifier.length < 5 || loading}
                            className="w-full h-14 border border-white/10 rounded-full text-lg font-manrope font-bold bg-white text-black hover:bg-gray-200 bubble-glow-hover transition-all relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--accent-pink))] to-[hsl(var(--accent-purple))] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <span className="relative z-10 flex items-center justify-center group-hover:text-white">
                                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                    <>Continue <ArrowRight className="ml-2 w-5 h-5" /></>
                                )}
                            </span>
                        </Button>
                    </motion.form>
                ) : (
                    <motion.form
                        key="otp-form"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        onSubmit={handleVerifyOtp}
                        className="space-y-6"
                    >
                        <div className="space-y-4 text-center">
                            <div className="mx-auto w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-2">
                                <Lock className="w-8 h-8 text-[hsl(var(--accent-purple))]" />
                            </div>
                            <h3 className="text-xl font-bold font-inter text-white">Enter OTP</h3>
                            <p className="text-sm text-gray-400 font-inter">
                                We&apos;ve sent a code to <span className="font-semibold text-gray-200">{identifier}</span>
                            </p>
                        </div>

                        <div className="flex justify-center">
                            <Input
                                type="text"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                placeholder="000000"
                                className="h-16 w-full max-w-[240px] text-center text-3xl tracking-[0.5em] font-mono rounded-xl bg-black border-white/20 focus:ring-[hsl(var(--accent-pink))] focus:border-[hsl(var(--accent-pink))] transition-all font-bold text-white"
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={otp.length !== 6 || loading}
                            className="w-full h-14 border border-white/10 rounded-full text-lg font-manrope font-bold bg-white text-black hover:bg-gray-200 bubble-glow-hover transition-all relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--accent-pink))] to-[hsl(var(--accent-purple))] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <span className="relative z-10 flex items-center justify-center group-hover:text-white">
                                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Verify & Continue"}
                            </span>
                        </Button>

                        <div className="text-center pt-2">
                            <button
                                type="button"
                                onClick={() => setStep("identifier")}
                                className="text-sm text-gray-500 hover:text-white transition-colors font-inter"
                            >
                                Wrong {method}? Go back
                            </button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default function AuthPage() {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
            <Link href="/" className="absolute top-6 left-6 text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--accent-pink))] to-[hsl(var(--accent-purple))]">DostAI</span>
                <span>❤️</span>
            </Link>

            <Suspense fallback={<div className="text-white">Loading...</div>}>
                <AuthForm />
            </Suspense>
        </div>
    );
}
