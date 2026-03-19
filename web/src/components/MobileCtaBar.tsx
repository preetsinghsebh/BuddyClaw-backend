'use client'
import { useEffect, useState } from 'react'

export default function MobileCtaBar() {
    const [show, setShow] = useState(false)

    useEffect(() => {
        const onScroll = () => {
            const hero = document.getElementById('hero')
            if (!hero) return
            const heroBottom = hero.getBoundingClientRect().bottom
            setShow(heroBottom < 0)
        }
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    return (
        <div style={{
            position: 'fixed',
            bottom: 0, left: 0, right: 0,
            zIndex: 900,
            padding: '0.75rem 1.25rem',
            background: 'rgba(5,5,10,0.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255,179,0,0.15)',
            // Only visible on mobile
            display: 'none',
            // Show/hide via transform
            transform: show ? 'translateY(0)' : 'translateY(100%)',
            transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
            className="mobile-cta-bar"
        >
            <a
                href="#experiences"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    width: '100%',
                    background: 'linear-gradient(135deg, #FF8C00 0%, #FF4500 100%)',
                    color: '#fff',
                    fontFamily: 'var(--font-ui)',
                    fontWeight: 800,
                    fontSize: '1rem',
                    padding: '0.9rem 1.5rem',
                    borderRadius: 9999,
                    textDecoration: 'none',
                    boxShadow: '0 0 30px rgba(255,100,0,0.4)',
                    letterSpacing: '0.01em',
                }}
            >
                <span>Start chatting → Free on Telegram</span>
                <span style={{ fontSize: '1.1rem' }}>✦</span>
            </a>
        </div>
    )
}
