"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Star, Zap, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SubscriptionPage() {
    const router = useRouter();
    const [loading, setLoading] = useState<"free" | "premium" | null>(null);

    const handleSelectPlan = (plan: "free" | "premium") => {
        setLoading(plan);
        // TODO: Integrate Razorpay SDK for premium, or just update DB for free tier
        setTimeout(() => {
            setLoading(null);
            router.push("/dashboard");
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#A78BFA]/20 via-[#C4B5FD]/10 to-[#FECDD3]/20 dark:from-indigo-950/40 dark:via-background dark:to-rose-950/20 py-12 px-4 flex flex-col items-center">

            <div className="w-full max-w-5xl flex justify-between items-center mb-12">
                <Link href="/" className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-lavender-500 to-rose-400">BuddyClaw</span>
                    <span>❤️</span>
                </Link>
                <div className="text-sm font-medium text-gray-500 bg-white/50 dark:bg-black/50 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-800 backdrop-blur-sm">
                    Step 3 of 3
                </div>
            </div>

            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
                    Choose Your Plan
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg max-w-xl mx-auto">
                    During our 30-day "Free for All" launch, all users get True Companion features for free. Sign up now to claim your permanent Founder perks.
                </p>
            </div>

            <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 relative z-10">

                {/* Free Tier */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/60 dark:bg-black/50 backdrop-blur-lg border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all flex flex-col h-full"
                >
                    <div className="mb-6">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Basic Friend</h3>
                        <div className="flex items-baseline gap-1 text-gray-900 dark:text-white">
                            <span className="text-4xl font-extrabold">₹0</span>
                            <span className="text-gray-500 dark:text-gray-400">/ forever</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">Perfect for casual chatting.</p>
                    </div>

                    <ul className="space-y-4 mb-8 flex-1">
                        {["20 Daily Messages", "Standard Personality", "Basic Memory (lasts 24hrs)", "Shared infrastructure"].map((feature, i) => (
                            <li key={i} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                <CheckCircle2 className="w-5 h-5 text-gray-400" />
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>

                    <Button
                        variant="outline"
                        className="w-full h-14 rounded-xl text-lg font-bold border-2 border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-600 bg-transparent"
                        onClick={() => handleSelectPlan("free")}
                        disabled={loading !== null}
                    >
                        {loading === "free" ? "Setting up..." : "Start Free"}
                    </Button>
                </motion.div>

                {/* Premium Tier */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-gray-900 backdrop-blur-lg border-2 border-lavender-500 dark:border-lavender-500/50 rounded-3xl p-8 shadow-2xl relative flex flex-col h-full transform md:-translate-y-4"
                >
                    <div className="absolute top-0 right-8 -translate-y-1/2">
                        <span className="bg-gradient-to-r from-lavender-500 to-rose-400 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-lg">
                            <Star className="w-3 h-3 fill-current" /> Most Popular
                        </span>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                            True Companion <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
                        </h3>
                         <div className="flex items-baseline gap-1 text-gray-900 dark:text-white">
                            <span className="text-4xl font-extrabold line-through opacity-30 text-rose-500">₹399</span>
                            <span className="text-4xl font-extrabold">₹0</span>
                            <span className="text-gray-500 dark:text-gray-400">/ launch month</span>
                        </div>
                        <p className="text-sm text-lavender-600 dark:text-lavender-400 font-bold mt-2">Unlimited 24/7 access + Founder Badge included!</p>
                    </div>

                    <ul className="space-y-4 mb-8 flex-1">
                        {[
                            "Unlimited Daily Messages",
                            "Deep Infinite Memory",
                            "Dedicated 24/7 Availability",
                            "Priority Infrastructure Access",
                            "Priority Support"
                        ].map((feature, i) => (
                            <li key={i} className="flex items-center gap-3 text-gray-800 dark:text-gray-200">
                                <CheckCircle2 className="w-5 h-5 text-lavender-500" />
                                <span className="font-medium">{feature}</span>
                            </li>
                        ))}
                    </ul>

                    <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-3 rounded-lg text-xs flex items-start gap-2 mb-6">
                        <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                        <p>Secure payment via Razorpay. Cancel anytime securely through your dashboard.</p>
                    </div>

                    <Button
                        className="w-full h-14 rounded-xl text-lg font-bold bg-gradient-to-r from-lavender-500 to-rose-400 hover:from-lavender-600 hover:to-rose-500 text-white shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
                        onClick={() => handleSelectPlan("premium")}
                        disabled={loading !== null}
                    >
                        {loading === "premium" ? "Loading payment..." : "Get Free Founder Access"}
                    </Button>
                </motion.div>

            </div>
        </div>
    );
}
