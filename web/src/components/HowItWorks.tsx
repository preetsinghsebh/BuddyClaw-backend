'use client'
import SectionReveal from './SectionReveal'

const STEPS = [
    {
        number: '01',
        title: 'CHOOSE YOUR PERSONA',
        desc: 'Skip the generic "As an AI" replies. Choose a companion with a specific archetype—from stoic protectors to savage roasters—that matches your energy.',
        icon: '🎯',
        color: '#FFB300',
    },
    {
        number: '02',
        title: 'SYNC INSTANTLY',
        desc: 'Connect via Telegram. No waiting for a "match" or a reply. Start talking to your "person" immediately with zero friction.',
        icon: '⚡',
        color: '#A855F7',
    },
    {
        number: '03',
        title: 'PERSONAL AGENCY',
        desc: 'Experience a companion powered by OpenClaw logic that remembers your lore, your history, and stays in your corner across every session.',
        icon: '🔒',
        color: '#E8197D',
    },
]

export default function HowItWorks() {
    return (
        <section id="how-it-works" style={{ backgroundColor: 'var(--bg-2)', padding: '6rem 2rem' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>

                {/* Header */}
                <SectionReveal>
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                            background: 'rgba(255,179,0,0.1)',
                            border: '1px solid rgba(255,179,0,0.25)',
                            borderRadius: 9999, padding: '0.35rem 1rem',
                            marginBottom: '1.5rem',
                        }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-ui)' }}>
                                ✦ Skip the Games
                            </span>
                        </div>
                        <h2 style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 'clamp(2.8rem, 8vw, 5.5rem)',
                            color: '#fff',
                            lineHeight: 1,
                            letterSpacing: '-0.01em',
                            fontWeight: 300,
                        }}>
                            How it{' '}
                            <span style={{
                                background: 'linear-gradient(135deg, var(--gold-light), var(--orange))',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                opacity: 0.9,
                            }}>works</span>
                        </h2>
                    </div>
                </SectionReveal>

                {/* Steps */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '1.5rem',
                    position: 'relative',
                }} className="hiw-grid">
                    {STEPS.map((step, i) => (
                        <SectionReveal key={step.number} delay={i * 120} direction="up">
                            <div
                                style={{
                                    background: 'var(--surface)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    borderRadius: 24,
                                    padding: '2.5rem 2rem',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                }}
                                onMouseEnter={e => {
                                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-6px)'
                                        ; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 24px 60px rgba(0,0,0,0.4), 0 0 30px ${step.color}20`
                                }}
                                onMouseLeave={e => {
                                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
                                        ; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
                                }}
                            >
                                {/* BG number watermark */}
                                <div style={{
                                    position: 'absolute', top: -20, right: -10,
                                    fontFamily: 'var(--font-display)',
                                    fontSize: '8rem', fontWeight: 400,
                                    color: 'rgba(255,255,255,0.025)',
                                    lineHeight: 1, pointerEvents: 'none',
                                    userSelect: 'none',
                                }}>{step.number}</div>

                                {/* Top bar */}
                                <div style={{ height: 3, background: `linear-gradient(90deg, ${step.color}, transparent)`, borderRadius: 2, marginBottom: '1.75rem' }} />

                                {/* Icon */}
                                <div style={{
                                    width: 56, height: 56, borderRadius: 16,
                                    background: `${step.color}18`,
                                    border: `1px solid ${step.color}30`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.6rem', marginBottom: '1.25rem',
                                }}>
                                    {step.icon}
                                </div>

                                {/* Step number */}
                                <div style={{
                                    fontFamily: 'var(--font-display)',
                                    fontSize: '0.85rem', letterSpacing: '0.1em',
                                    color: step.color, marginBottom: '0.5rem',
                                }}>STEP {step.number}</div>

                                {/* Title */}
                                <h3 style={{
                                    fontFamily: 'var(--font-display)',
                                    fontSize: '1.7rem', color: '#fff',
                                    letterSpacing: '0.03em', marginBottom: '0.85rem',
                                }}>{step.title}</h3>

                                {/* Desc */}
                                <p style={{
                                    fontFamily: 'var(--font-body)',
                                    fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)',
                                    lineHeight: 1.7,
                                }}>{step.desc}</p>
                            </div>
                        </SectionReveal>
                    ))}
                </div>

                {/* Bottom CTA */}
                <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
                    <a
                        href="#experiences"
                        className="btn-gold"
                        style={{ fontSize: '1.05rem', padding: '1rem 2.5rem' }}
                    >
                        Start for Free ✦
                    </a>
                </div>
            </div>
        </section>
    )
}
