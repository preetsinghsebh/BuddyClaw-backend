'use client'
import Image from 'next/image'
import { useEffect, useState, useRef, useCallback } from 'react'

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

const CYCLING_WORDS = ['FIRST TEXT.', 'LAST CHAT.', 'SAFE PLACE.', 'REAL FRIEND.', 'CHOSEN FAMILY.']

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
            }}
        >
            <div style={{
                position: isMobile ? 'relative' : 'absolute',
                inset: isMobile ? 'auto' : 0,
                height: isMobile ? '62vh' : '100%',
                width: '100%',
                zIndex: 0,
                overflow: 'hidden'
            }}>
                <Image
                    src="/hero-exact.png"
                    alt="A vibrant group of friends — anime characters and real people — celebrating together"
                    fill
                    style={{
                        objectFit: 'cover',
                        objectPosition: 'center top',
                        // Parallax: move bg slower than scroll
                        transform: isMobile ? 'none' : `translateY(${scrollY * 0.3}px)`,
                        transition: 'transform 0.05s linear',
                    }}
                    priority
                />
            </div>

            {/* MOBILE overlay */}
            {isMobile && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: '62vh', zIndex: 1,
                    background: `linear-gradient(to bottom,
                        rgba(5,5,10,0.3) 0%,
                        rgba(5,5,10,0.0) 20%,
                        rgba(5,5,10,0.0) 70%,
                        rgba(5,5,10,0.6) 88%,
                        rgba(5,5,10,1) 100%
                    )`,
                }} />
            )}

            {/* DESKTOP overlay */}
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

            {/* ============ MOBILE LAYOUT ============ */}
            {isMobile && (
                <div style={{
                    position: 'relative', zIndex: 10,
                    width: isMobile ? '100%' : 'auto',
                    padding: isMobile ? '4rem 1.4rem 6rem' : '0 4rem',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'flex-start', gap: '0',
                    background: isMobile ? '#05050a' : 'transparent',
                    textAlign: 'left',
                }}>
                    {/* Launch Badge */}
                    <div style={{ height: '3.5rem' }} />

                    <h1 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(3.2rem, 14vw, 4.8rem)',
                        fontWeight: 300,
                        color: '#ffffff',
                        lineHeight: 1.0,
                        letterSpacing: '-0.04em',
                        marginBottom: '2rem',
                        opacity: 0.95,
                        textWrap: 'balance' as any,
                    }}>
                        Beyond the feed. <br /> <span className="gradient-text-gold">Into the circle.</span> <br /> Your person is waiting.
                    </h1>

                    {/* Sub text */}
                    <p style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '1.25rem',
                        color: 'rgba(255,255,255,0.7)',
                        lineHeight: 1.4,
                        marginBottom: '3.5rem',
                        maxWidth: 360,
                        fontWeight: 400,
                        letterSpacing: '0.01em',
                        marginInline: '0',
                        opacity: 0.9,
                    }}>
                        Stop searching through the noise. Find the connection that was built specifically for you.
                    </p>

                    {/* Primary CTA */}
                    <a
                        href="#experiences"
                        className="btn-white-pill"
                        style={{
                            width: 'auto',
                            padding: '0.9rem 3.5rem',
                            fontSize: '1rem',
                            marginBottom: '0.75rem',
                        }}
                    >
                        Start chatting
                    </a>


                    <div ref={statRef} style={{
                        display: 'flex', alignItems: 'center', gap: '0.6rem',
                        marginTop: '1.25rem',
                        justifyContent: 'flex-start',
                    }}>
                        <div style={{ display: 'flex' }}>
                            {['🧑‍🎤', '👩‍💻', '🧑‍🎨', '👩‍🚀'].map((emoji, i) => (
                                <div key={i} style={{
                                    width: 28, height: 28, borderRadius: '50%',
                                    background: `hsl(${i * 60}, 60%, 50%)`,
                                    border: '2px solid rgba(5,5,10,0.8)',
                                    marginLeft: i === 0 ? 0 : -9,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.75rem',
                                }}>{emoji}</div>
                            ))}
                        </div>
                        <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>
                            <strong style={{ color: 'var(--gold)' }}>{friendCount.toLocaleString()}+</strong> friendships sparked
                        </span>
                    </div>

                    {/* Vibe badges */}
                    <div style={{
                        marginTop: '3.5rem',
                        display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'flex-start',
                        width: '100%',
                        position: 'relative',
                        paddingBottom: '1rem',
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
                                zIndex: 2,
                            }}>
                                <span>{badge.icon}</span>
                                <span>{badge.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ============ DESKTOP LAYOUT ============ */}
            {!isMobile && mounted && (
                <div style={{
                    position: 'relative', zIndex: 10,
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                    padding: '0 4rem',
                    marginTop: '4rem',
                    width: '100%',
                    maxWidth: '1400px',
                }}>

                    {/* Launch Badge */}
                    <div style={{ height: '5rem' }} />

                    {/* Main headline */}
                    <h1 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(4.5rem, 10vw, 8rem)',
                        fontWeight: 300,
                        color: '#fff',
                        lineHeight: 1.0,
                        letterSpacing: '-0.03em',
                        marginBottom: '2.5rem',
                        animation: 'fadeUp 0.6s 0.2s ease both',
                        maxWidth: 1100,
                        textWrap: 'balance' as any,
                    }}>
                        Beyond the feed. <br /> <span className="gradient-text-gold">Into the circle.</span> <br /> Your person is waiting.
                    </h1>

                    {/* Sub-headline */}
                    <p style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 'clamp(1.2rem, 2.2vw, 1.55rem)',
                        color: 'rgba(255,255,255,0.7)',
                        marginBottom: '4rem',
                        maxWidth: 800,
                        lineHeight: 1.5,
                        fontWeight: 400,
                        letterSpacing: '0.01em',
                        animation: 'fadeUp 0.7s 0.35s ease both',
                    }}>
                        Stop searching through the noise. Whether it's a stoic protector or your favorite anime legend, find the connection that was built specifically for you.
                    </p>

                    <div className="hero-btns" style={{
                        display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'flex-start', flexWrap: 'wrap',
                        animation: 'fadeUp 0.7s 0.5s ease both',
                    }}>
                        <a
                            href="#experiences"
                            className="btn-white-pill"
                            style={{ padding: '1rem 3.5rem' }}
                        >
                            Start chatting
                        </a>
                        <a
                            href="/auth"
                            className="btn-glass"
                            style={{ 
                                padding: '1rem 3.5rem',
                                borderRadius: 9999,
                                border: '1px solid rgba(255,255,255,0.2)',
                                background: 'rgba(255,255,255,0.05)',
                                color: '#fff',
                                textDecoration: 'none',
                                fontWeight: 500,
                                fontSize: '1rem',
                                backdropFilter: 'blur(10px)',
                                transition: 'all 0.3s ease',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                        >
                            Sign In
                        </a>
                    </div>

                    <div ref={statRef} style={{
                        marginTop: '2.5rem',
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        animation: 'fadeUp 0.7s 0.65s ease both',
                        justifyContent: 'flex-start',
                    }}>
                        <div style={{ display: 'flex' }}>
                            {['🧑‍🎤', '👩‍💻', '🧑‍🎨', '👩‍🚀', '🧑‍🔬'].map((emoji, i) => (
                                <div key={i} style={{
                                    width: 32, height: 32, borderRadius: '50%',
                                    background: `hsl(${i * 60}, 60%, 50%)`,
                                    border: '2px solid rgba(10,10,15,0.8)',
                                    marginLeft: i === 0 ? 0 : -10,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.9rem',
                                }}>{emoji}</div>
                            ))}
                        </div>
                        <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>
                            <strong style={{ color: 'var(--gold)' }}>{friendCount.toLocaleString()}+</strong> friendships sparked
                        </span>
                    </div>

                    <div style={{
                        marginTop: '3.5rem',
                        display: 'flex', flexWrap: 'wrap', gap: '0.6rem', justifyContent: 'flex-start',
                        maxWidth: 700,
                        animation: 'fadeUp 0.8s 0.8s ease both',
                    }}>
                        {BADGES.map((badge, i) => (
                            <div key={badge.label} style={{
                                display: 'flex', alignItems: 'center', gap: '0.4rem',
                                background: 'rgba(255,255,255,0.06)',
                                backdropFilter: 'blur(12px)',
                                border: `1px solid ${badge.color}30`,
                                borderRadius: 9999,
                                padding: '0.35rem 0.9rem',
                                fontSize: '0.8rem',
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
                </div>
            )}

            {/* Bottom strip + scroll indicator */}
            {!isMobile && (
                <>
                    <div style={{
                        position: 'absolute', bottom: '2rem', left: 0, right: 0,
                        zIndex: 10, textAlign: 'center',
                    }}>
                        <p style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 'clamp(0.65rem, 1.5vw, 0.9rem)',
                            letterSpacing: '0.2em',
                            color: 'rgba(255,255,255,0.25)',
                            textTransform: 'uppercase',
                        }}>
                            Stay Hungry. Stay Strong. ✦
                        </p>
                    </div>

                    {/* Scroll down indicator */}
                    <div style={{
                        position: 'absolute', bottom: '4.5rem', left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 10,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem',
                        animation: 'fadeIn 1s 1.5s ease both',
                        opacity: scrollY > 80 ? 0 : 1,
                        transition: 'opacity 0.4s ease',
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
                </>
            )}
        </section>
    )
}
