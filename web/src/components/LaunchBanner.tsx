'use client'
import { useState, useEffect } from 'react'
import { Timer, Zap } from 'lucide-react'

export default function LaunchBanner() {
    const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, minutes: number, seconds: number } | null>(null)

    // Set launch date to March 21, 2026
    const LAUNCH_DATE = new Date('2026-03-21T00:00:00Z')
    const TOTAL_DAYS = 30
    const CYCLE_DAYS = 7
    const FINAL_END_DATE = new Date(LAUNCH_DATE.getTime() + TOTAL_DAYS * 24 * 60 * 60 * 1000)

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date()
            const elapsedMs = now.getTime() - LAUNCH_DATE.getTime()
            
            if (now >= FINAL_END_DATE) {
                setTimeLeft(null)
                clearInterval(timer)
                return
            }

            // Calculate current 7-day cycle end
            const currentCycleIndex = Math.floor(elapsedMs / (CYCLE_DAYS * 24 * 60 * 60 * 1000))
            let currentCycleEndDate = new Date(LAUNCH_DATE.getTime() + (currentCycleIndex + 1) * CYCLE_DAYS * 24 * 60 * 60 * 1000)
            
            // Cap it at the final end date
            if (currentCycleEndDate > FINAL_END_DATE) {
                currentCycleEndDate = FINAL_END_DATE
            }

            const diff = currentCycleEndDate.getTime() - now.getTime()

            const days = Math.floor(diff / (1000 * 60 * 60 * 24))
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
            const minutes = Math.floor((diff / (1000 * 60)) % 60)
            const seconds = Math.floor((diff / 1000) % 60)

            setTimeLeft({ days, hours, minutes, seconds })
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    if (!timeLeft) return null

    return (
        <div className="w-full bg-gradient-to-r from-lavender-600 via-rose-500 to-lavender-600 bg-[length:200%_auto] animate-gradient-x py-2 px-4 sticky top-0 z-[100] border-b border-white/10 shadow-lg min-h-[92px] md:min-h-0">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6 text-white text-center">
                <div className="flex items-center gap-2 font-bold tracking-tight text-sm md:text-base">
                    <Zap className="w-4 h-4 fill-amber-300 text-amber-300 animate-pulse" />
                    <span>LAUNCH OFFER: BuddyClaw is FREE for All!</span>
                    <span className="hidden md:inline bg-white/20 px-2 py-0.5 rounded text-[10px] uppercase tracking-widest">BuddyClaw Circle</span>
                </div>
                
                <div className="flex items-center gap-3 font-mono text-xs md:text-sm bg-black/20 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                    <Timer className="w-3 h-3 text-lavender-200" />
                    <div className="flex gap-1.5">
                        <span className="flex flex-col items-center">
                            <span className="font-bold">{String(timeLeft.days).padStart(2, '0')}</span>
                            <span className="text-[8px] opacity-60 -mt-1 uppercase">Days</span>
                        </span>
                        <span className="opacity-40 mt-0.5">:</span>
                        <span className="flex flex-col items-center">
                            <span className="font-bold">{String(timeLeft.hours).padStart(2, '0')}</span>
                            <span className="text-[8px] opacity-60 -mt-1 uppercase">Hrs</span>
                        </span>
                        <span className="opacity-40 mt-0.5">:</span>
                        <span className="flex flex-col items-center">
                            <span className="font-bold">{String(timeLeft.minutes).padStart(2, '0')}</span>
                            <span className="text-[8px] opacity-60 -mt-1 uppercase">Min</span>
                        </span>
                        <span className="opacity-40 mt-0.5">:</span>
                        <span className="flex flex-col items-center">
                            <span className="font-bold text-amber-300">{String(timeLeft.seconds).padStart(2, '0')}</span>
                            <span className="text-[8px] opacity-60 -mt-1 uppercase">Sec</span>
                        </span>
                    </div>
                </div>

                <a 
                    href="/auth" 
                    className="hidden lg:block text-[11px] font-bold uppercase tracking-wider bg-white text-rose-600 px-4 py-1.5 rounded-full hover:bg-rose-50 transition-colors shadow-sm"
                >
                    Claim My Perks
                </a>
            </div>
            
            <style jsx global>{`
                @keyframes gradient-x {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .animate-gradient-x {
                    animation: gradient-x 6s ease infinite;
                }
            `}</style>
        </div>
    )
}
