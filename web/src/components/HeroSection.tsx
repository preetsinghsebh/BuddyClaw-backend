'use client'
import Image from 'next/image'
import { useEffect, useState, useRef, useCallback } from 'react'
import { Zap } from 'lucide-react'

const BADGES = [
    { icon: '🧸', label: 'Ziva', color: '#FF69B4' },
    { icon: '❤️', label: 'Liam', color: '#4A90E2' },
    { icon: '😂', label: 'Roaster', color: '#FFD700' },
    { icon: '🌙', label: 'Midnight', color: '#6A5ACD' },
    { icon: '🫂', label: 'Listener', color: '#00C896' },
    { icon: '🔥', label: 'Hype', color: '#FF8C00' },
    { icon: '♾️', label: 'Gojo', color: '#9370DB' },
    { icon: '👀', label: 'Emma', color: '#808080' },
]

const CYCLING_WORDS = ['GLOBAL NUANCE.', 'PERSONAL AGENCY.', 'REAL MEMORY.', 'NO FILTERS.', 'YOUR AGENT.']

function useCountUp(target: number, duration = 2000, start = false) {
    const [count, setCount] = useState(0)
    useEffect(() => {
        if (!start) return
        let startTime: number
        const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp
            const progress = Math.min((timestamp - startTime) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * target))
            if (progress < 1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
    }, [target, duration, start])
    return count
}

export default function HeroSection() {
    const [mounted, setMounted] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const [wordIndex, setWordIndex] = useState(0)
    const [wordVisible, setWordVisible] = useState(true)
    const [scrollY, setScrollY] = useState(0)
    const [countStarted, setCountStarted] = useState(false)
    const heroRef = useRef<HTMLElement>(null)
    const statRef = useRef<HTMLDivElement>(null)

    const friendCount = useCountUp(5000, 2200, countStarted)

    useEffect(() => {
        setMounted(true)
        const checkMobile = () => setIsMobile(window.innerWidth <= 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    // Word cycle
    useEffect(() => {
        const interval = setInterval(() => {
            setWordVisible(false)
            setTimeout(() => {
                setWordIndex(i => (i + 1) % CYCLING_WORDS.length)
                setWordVisible(true)
            }, 350)
        }, 2800)
        return () => clearInterval(interval)
    }, [])

    // Parallax on scroll
    useEffect(() => {
        if (isMobile) return
        const onScroll = () => setScrollY(window.scrollY)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [isMobile])

    // Count-up observer
    useEffect(() => {
        const el = statRef.current
        if (!el) return
        const obs = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setCountStarted(true)
                obs.disconnect()
            }
        }, { threshold: 0.5 })
        obs.observe(el)
        return () => obs.disconnect()
    }, [mounted])

    return (
        <section
            ref={heroRef}
            id="hero"
            style={{
                position: 'relative',
                minHeight: isMobile ? 'auto' : '100vh',
                display: isMobile ? 'block' : 'flex',
                flexDirection: 'column',
                alignItems: isMobile ? 'stretch' : 'flex-start',
                justifyContent: isMobile ? 'stretch' : 'center',
                textAlign: 'left',
                overflow: 'visible',
                color: '#fff',
                background: isMobile ? '#05050a' : 'transparent',
                paddingTop: isMobile ? 64 : 0,
            }}
        >
            {/* Background Image Container */}
            <div style={{
                position: 'absolute',
                top: isMobile ? 64 : 0,
                left: 0,
                height: isMobile ? '62vh' : '100%',
                width: '100%',
                zIndex: 0,
                overflow: 'hidden'
            }}>
                <Image
                    src="/hero-exact.png"
                    alt="A vibrant group of friends celebrating together"
                    fill
                    style={{
                        objectFit: 'cover',
                        objectPosition: 'center top',
                        transform: isMobile ? 'none' : `translateY(${scrollY * 0.3}px)`,
                        transition: 'transform 0.05s linear',
                    }}
                    priority
                />
            </div>

            {/* Overlays */}
            {isMobile && (
                <div style={{
                    position: 'absolute', top: 64, left: 0, right: 0, height: '62vh', zIndex: 1,
                    background: `linear-gradient(to bottom,
                        rgba(5,5,10,0.3) 0%,
                        rgba(5,5,10,0.0) 20%,
                        rgba(5,5,10,0.0) 70%,
                        rgba(5,5,10,0.6) 88%,
                        rgba(5,5,10,1) 100%
                    )`,
                }} />
            )}
            {!isMobile && (
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 1,
                    background: `linear-gradient(to bottom,
                        rgba(10,10,15,0.7) 0%,
                        rgba(10,10,15,0.2) 30%,
                        rgba(10,10,15,0.15) 55%,
                        rgba(10,10,15,0.85) 85%,
                        rgba(10,10,15,1) 100%
                    )`,
                }} />
            )}

            {/* Noise texture */}
            <div style={{
                position: 'absolute', inset: 0, zIndex: 2, opacity: 0.06,
                backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'300\' height=\'300\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'300\' height=\'300\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
                pointerEvents: 'none',
            }} />

            {/* ============ UNIFIED CONTENT LAYOUT ============ */}
            {mounted && (
                <div style={{
                    position: 'relative', zIndex: 10,
                    width: '100%',
                    padding: isMobile ? '400px 1.4rem 6rem' : '400px 4rem 10rem',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'flex-start',
                    textAlign: 'left',
                    maxWidth: 1400,
                    marginInline: 'auto',
                }}>
                    {/* Launch Badge */}
                    <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-lavender-300">
                             🚀 Launch Week
                        </span>
                        <span className="bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-black animate-pulse shadow-[0_0_15px_rgba(251,191,36,0.4)]">
                             Free for All
                        </span>
                    </div>

                    <h1 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(3.2rem, 10vw, 6.5rem)',
                        fontWeight: 300,
                        color: '#ffffff',
                        lineHeight: 1.0,
                        letterSpacing: '-0.04em',
                        marginBottom: '2rem',
                        opacity: 0.95,
                        textWrap: 'balance' as any,
                    }}>
                        Companion Intelligence with a Soul. <br /> 
                        <span className="gradient-text-gold">Truly Global. Personal. Powerful.</span> <br /> 
                        Your person is waiting.
                    </h1>

                    <p style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: isMobile ? '1.15rem' : '1.4rem',
                        color: 'rgba(255,255,255,0.7)',
                        lineHeight: 1.4,
                        marginBottom: '3.5rem',
                        maxWidth: isMobile ? 360 : 650,
                        fontWeight: 400,
                        letterSpacing: '0.01em',
                        opacity: 0.9,
                    }}>
                        Powered by OpenClaw, BuddyClaw delivers the world's first AI companion that doesn't sound like a bot.
                    </p>

                    {/* CTAs */}
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <a
                            href="#experiences"
                            className="btn-white-pill"
                            style={{ padding: '0.9rem 3.5rem', fontSize: '1rem' }}
                        >
                            Join the BuddyClaw Circle
                        </a>
                        {!isMobile && (
                            <a
                                href="/auth"
                                className="btn-glass"
                                style={{ 
                                    padding: '0.9rem 3.5rem', borderRadius: 9999,
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: '#fff', textDecoration: 'none',
                                    display: 'flex', alignItems: 'center', fontSize: '1rem',
                                }}
                            >
                                Sign In
                            </a>
                        )}
                    </div>

                    {/* Stats */}
                    <div ref={statRef} style={{
                        display: 'flex', alignItems: 'center', gap: '0.6rem',
                        marginTop: '2.5rem',
                    }}>
                        <div style={{ display: 'flex' }}>
                            {['🧑‍🎤', '👩‍💻', '🧑‍🎨', '👩‍🚀', '🧑‍🔬'].map((emoji, i) => (
                                <div key={i} style={{
                                    width: 30, height: 30, borderRadius: '50%',
                                    background: `hsl(${i * 60}, 60%, 50%)`,
                                    border: '2px solid rgba(10,10,15,0.8)',
                                    marginLeft: i === 0 ? 0 : -10,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.85rem',
                                }}>{emoji}</div>
                            ))}
                        </div>
                        <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>
                            <strong style={{ color: 'var(--gold)' }}>{friendCount.toLocaleString()}+</strong> friendships sparked
                        </span>
                    </div>

                    {/* Vibe badges */}
                    <div style={{
                        marginTop: '4rem',
                        display: 'flex', flexWrap: 'wrap', gap: '0.5rem',
                        maxWidth: 800,
                    }}>
                        {BADGES.map((badge, i) => (
                            <div key={badge.label} style={{
                                display: 'flex', alignItems: 'center', gap: '0.35rem',
                                background: 'rgba(255,255,255,0.06)',
                                backdropFilter: 'blur(12px)',
                                border: `1px solid ${badge.color}30`,
                                borderRadius: 9999,
                                padding: '0.3rem 0.8rem',
                                fontSize: '0.72rem',
                                fontFamily: 'var(--font-ui)',
                                fontWeight: 600,
                                color: 'rgba(255,255,255,0.8)',
                                animation: `float ${3.5 + i * 0.4}s ease-in-out infinite`,
                                animationDelay: `${i * 0.15}s`,
                            }}>
                                <span>{badge.icon}</span>
                                <span>{badge.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Scroll Indicator */}
                    <div style={{
                        position: 'absolute', bottom: '1.5rem', left: isMobile ? '1.4rem' : '4rem',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem',
                        opacity: scrollY > 80 ? 0 : 1, transition: 'opacity 0.4s ease',
                    }}>
                        <div style={{
                            width: 1, height: 40,
                            background: 'linear-gradient(to bottom, rgba(255,179,0,0.6), transparent)',
                        }} />
                        <div style={{
                            width: 8, height: 8, borderRadius: '50%',
                            background: 'var(--gold)',
                            boxShadow: '0 0 12px rgba(255,179,0,0.6)',
                            animation: 'float 1.5s ease-in-out infinite',
                        }} />
                    </div>
                </div>
            )}
        </section>
    )
}
