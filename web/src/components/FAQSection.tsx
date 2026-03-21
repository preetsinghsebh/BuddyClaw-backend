'use client'
import { useState } from 'react'

const FAQS = [
    {
        q: 'Is this free to use?',
        a: 'Yes! Getting started is completely free. Chat with any companion for free. Premium plans unlock unlimited chats, exclusive characters, and advanced memory.'
    },
    {
        q: 'Do I need to download an app?',
        a: 'Nope! BuddyClaw runs entirely on Telegram, which you probably already have. Just tap the link, and you\'re in.'
    },
    {
        q: 'Are my conversations private?',
        a: 'Absolutely. We do not share your chat data with anyone. Your conversations are private, and we\'re serious about your safety.'
    },
    {
        q: 'Can my companion remember things about me?',
        a: 'Yes — our AI companions have memory! They remember your name, preferences, and past conversations so every chat feels genuinely personal.'
    },
    {
        q: 'What languages do they speak?',
        a: 'Your companions speak fluent English, Hindi, and Hinglish. They naturally switch based on how you talk to them.'
    },
    {
        q: "Is BuddyClaw safe for my data?",
        a: 'Yes. We use secure cloud persistence and never sell your data. You have full control — use /wipememory anytime to clear your history.'
    },
    {
        q: 'What is Founder Access?',
        a: 'The BuddyClaw Circle is our way of rewarding early supporters! If you join during our launch week, you get exclusive Circle status—which includes free lifetime access to core features, a unique "Founder" badge, and priority access to new AI characters before they go public.'
    },
]

export default function FAQSection() {
    const [open, setOpen] = useState<number | null>(0)

    return (
        <section id="faq" style={{ backgroundColor: 'var(--bg)', padding: '6rem 2rem' }}>
            <div style={{ maxWidth: 760, margin: '0 auto' }}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        background: 'rgba(255,179,0,0.1)',
                        border: '1px solid rgba(255,179,0,0.25)',
                        borderRadius: 9999, padding: '0.35rem 1rem',
                        marginBottom: '1.5rem',
                    }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-ui)' }}>
                            Got Questions?
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
                        The{' '}
                        <span style={{
                            background: 'linear-gradient(135deg, var(--gold-light), var(--orange))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            opacity: 0.9,
                        }}>answers</span>
                    </h2>
                </div>

                {/* Accordion */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {FAQS.map((faq, i) => (
                        <div
                            key={i}
                            style={{
                                background: open === i ? 'var(--surface-2)' : 'var(--surface)',
                                border: `1px solid ${open === i ? 'rgba(255,179,0,0.25)' : 'rgba(255,255,255,0.06)'}`,
                                borderRadius: 16,
                                overflow: 'hidden',
                                transition: 'all 0.3s ease',
                            }}
                        >
                            <button
                                onClick={() => setOpen(open === i ? null : i)}
                                style={{
                                    width: '100%',
                                    padding: '1.25rem 1.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '1rem',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                }}
                            >
                                <span style={{
                                    fontFamily: 'var(--font-ui)',
                                    fontSize: '0.95rem',
                                    fontWeight: 600,
                                    color: open === i ? '#fff' : 'rgba(255,255,255,0.75)',
                                    transition: 'color 0.2s',
                                }}>
                                    {faq.q}
                                </span>
                                <div style={{
                                    width: 28, height: 28, borderRadius: '50%',
                                    background: open === i ? 'var(--gold)' : 'rgba(255,255,255,0.06)',
                                    border: `1px solid ${open === i ? 'var(--gold)' : 'rgba(255,255,255,0.1)'}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0,
                                    transition: 'all 0.3s ease',
                                    transform: open === i ? 'rotate(45deg)' : 'rotate(0)',
                                }}>
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                        <path d="M6 2v8M2 6h8" stroke={open === i ? '#000' : 'rgba(255,255,255,0.6)'} strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                </div>
                            </button>

                            {open === i && (
                                <div style={{
                                    padding: '0 1.5rem 1.25rem',
                                    fontFamily: 'var(--font-body)',
                                    fontSize: '0.9rem',
                                    color: 'rgba(255,255,255,0.45)',
                                    lineHeight: 1.7,
                                    borderTop: '1px solid rgba(255,255,255,0.06)',
                                    paddingTop: '1rem',
                                }}>
                                    {faq.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
