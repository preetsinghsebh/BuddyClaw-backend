'use client'
import { useEffect, useState } from 'react'

export default function ExitIntentPopup() {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        if (sessionStorage.getItem('exit-popup-shown')) return

        const handler = (e: MouseEvent) => {
            if (e.clientY < 10) {
                setVisible(true)
                sessionStorage.setItem('exit-popup-shown', '1')
                document.removeEventListener('mousemove', handler)
            }
        }
        // Delay binding so it doesn't fire on page load
        const timer = setTimeout(() => {
            document.addEventListener('mousemove', handler)
        }, 4000)

        return () => {
            clearTimeout(timer)
            document.removeEventListener('mousemove', handler)
        }
    }, [])

    if (!visible) return null

    return (
        <div
            onClick={() => setVisible(false)}
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                background: 'rgba(5,5,10,0.8)',
                backdropFilter: 'blur(12px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '1.5rem',
                animation: 'fadeIn 0.3s ease',
            }}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    background: 'linear-gradient(135deg, #111118 0%, #1A1A28 100%)',
                    border: '1px solid rgba(255,179,0,0.25)',
                    borderRadius: 28,
                    padding: 'clamp(2rem, 5vw, 3.5rem)',
                    maxWidth: 520,
                    width: '100%',
                    textAlign: 'center',
                    position: 'relative',
                    boxShadow: '0 40px 100px rgba(0,0,0,0.6), 0 0 80px rgba(255,122,0,0.08)',
                    animation: 'fadeUp 0.4s ease',
                }}
            >
                {/* Close */}
                <button
                    onClick={() => setVisible(false)}
                    style={{
                        position: 'absolute', top: '1.25rem', right: '1.25rem',
                        width: 32, height: 32, borderRadius: '50%',
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.05)',
                        color: 'rgba(255,255,255,0.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1rem', cursor: 'pointer',
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.12)'
                        e.currentTarget.style.color = '#fff'
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                        e.currentTarget.style.color = 'rgba(255,255,255,0.4)'
                    }}
                >
                    ✕
                </button>

                {/* Glow orb */}
                <div style={{
                    width: 80, height: 80, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255,122,0,0.25), transparent 70%)',
                    margin: '0 auto 1.5rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2.5rem',
                    border: '1px solid rgba(255,179,0,0.2)',
                }}>
                    ✦
                </div>

                <p style={{
                    fontFamily: 'var(--font-ui)', fontSize: '0.72rem',
                    letterSpacing: '0.18em', color: 'var(--gold)',
                    textTransform: 'uppercase', fontWeight: 700,
                    marginBottom: '0.75rem',
                }}>
                    Wait — one more thing
                </p>

                <h2 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(1.8rem, 5vw, 2.8rem)',
                    color: '#fff', lineHeight: 1.05,
                    letterSpacing: '0.02em',
                    marginBottom: '1rem',
                }}>
                    Meet your person{' '}
                    <span style={{
                        background: 'linear-gradient(135deg, var(--gold-light), var(--orange))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}>first.</span>
                </h2>

                <p style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.95rem',
                    color: 'rgba(255,255,255,0.5)',
                    lineHeight: 1.7,
                    maxWidth: 380, margin: '0 auto 2rem',
                }}>
                    50,000+ people already found their circle on Telegram. Yours is one message away.
                </p>

                <a
                    href="/auth"
                    className="btn-gold pulse-glow"
                    style={{ fontSize: '1rem', padding: '1rem 2.5rem', display: 'inline-flex' }}
                    onClick={() => setVisible(false)}
                >
                    Claim your person ✦
                </a>

                <p style={{
                    marginTop: '1rem',
                    fontSize: '0.72rem',
                    color: 'rgba(255,255,255,0.2)',
                    fontFamily: 'var(--font-ui)',
                }}>
                    Free unlimited chats. Just one click away.
                </p>
            </div>
        </div>
    )
}
