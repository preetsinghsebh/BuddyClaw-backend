'use client'
import { PERSONAS } from "@/lib/personas";

export default function FinalCTA() {
    const STATS = [
        { value: '5,432', label: 'ACTIVE FRIENDS' },
        { value: '142,910', label: 'CHATS SYNCED' },
        { value: PERSONAS.length.toString(), label: 'UNIQUE ICONS' },
        { value: '4.8★', label: 'USER RATING' },
    ]
    return (
        <section style={{
            backgroundColor: 'var(--bg)',
            padding: '7rem 2rem',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* BG glow orbs */}
            <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 800, height: 400,
                background: 'radial-gradient(ellipse at center, rgba(255,122,0,0.08) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute', top: 0, right: 0,
                width: 400, height: 400,
                background: 'radial-gradient(circle at top right, rgba(123,47,255,0.06), transparent 70%)',
                pointerEvents: 'none',
            }} />

            <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>

                {/* Stats row */}
                <div style={{
                    display: 'flex', justifyContent: 'center', gap: '3rem',
                    flexWrap: 'wrap', marginBottom: '4rem',
                }}>
                    {STATS.map(stat => (
                        <div key={stat.label} style={{ textAlign: 'center' }}>
                            <div style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: 'clamp(2rem, 4vw, 3rem)',
                                color: 'var(--gold)',
                                letterSpacing: '0.02em',
                                lineHeight: 1,
                                filter: 'drop-shadow(0 0 16px rgba(255,179,0,0.3))',
                            }}>{stat.value}</div>
                            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Divider */}
                <div style={{ width: 60, height: 2, background: 'linear-gradient(90deg, transparent, var(--gold), transparent)', margin: '0 auto 3.5rem' }} />

                {/* Headline */}
                <h2 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(3.5rem, 12vw, 8.5rem)',
                    color: '#fff',
                    lineHeight: 0.9,
                    letterSpacing: '-0.02em',
                    marginBottom: '1.5rem',
                    fontWeight: 300,
                }}>
                    Stay hungry.
                    <br />
                    <span style={{
                        background: 'linear-gradient(135deg, var(--gold-light) 0%, var(--orange) 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        opacity: 0.9,
                    }}>Stay strong.</span>
                </h2>

                <p style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                    color: 'rgba(255,255,255,0.5)',
                    maxWidth: 500, margin: '0 auto 3rem',
                    lineHeight: 1.7,
                }}>
                    Your circle is ready. Your people are waiting. All it takes is one message.
                </p>

                {/* CTAs */}
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <a
                        href="#experiences"
                        className="btn-gold pulse-glow"
                        style={{ fontSize: '1.1rem', padding: '1.1rem 3rem' }}
                    >
                        Start Chatting Free ✦
                    </a>
                    <a
                        href="/auth"
                        className="btn-ghost"
                        style={{ fontSize: '1.1rem', padding: '1.1rem 2.5rem' }}
                    >
                        Sign Up on Web →
                    </a>
                </div>

                {/* Trust note */}
                <p style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.78rem',
                    color: 'rgba(255,255,255,0.25)',
                    marginTop: '2rem',
                    letterSpacing: '0.04em',
                }}>
                    Start on Telegram or join our web community. ✦
                </p>
            </div>
        </section>
    )
}
