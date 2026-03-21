'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Timer, Zap } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Friends', href: '#experiences' },
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'FAQ', href: '#faq' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, minutes: number, seconds: number } | null>(null)

  // Set launch date to March 21, 2026
  const LAUNCH_DATE = new Date('2026-03-21T00:00:00Z')
  const TOTAL_DAYS = 30
  const CYCLE_DAYS = 7
  const FINAL_END_DATE = new Date(LAUNCH_DATE.getTime() + TOTAL_DAYS * 24 * 60 * 60 * 1000)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)

    checkMobile()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', checkMobile)

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

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', checkMobile)
      clearInterval(timer)
    }
  }, [])

  return (
    <>
      <nav style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 1000,
        backgroundColor: scrolled ? 'rgba(10, 10, 15, 0.98)' : 'rgba(5, 5, 10, 0.6)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: (scrolled) ? '1px solid rgba(255,179,0,0.15)' : '1px solid transparent',
        transition: 'all 0.4s ease',
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: isMobile ? '0 0.75rem' : '0 1.5rem',
          height: isMobile ? 64 : 68,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: isMobile ? '0.5rem' : '1rem',
        }}>

            {/* Logo */}
            <a href="/" style={{
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
            }}>
              <Image
                src="/logo-circle.png"
                alt="BuddyClaw Logo"
                width={45}
                height={45}
                style={{
                  borderRadius: '50%',
                  objectFit: 'cover',
                  opacity: 0.95,
                  border: '2px solid #000',
                  backgroundColor: '#000'
                }}
              />
            </a>

            {/* Timer in center for Mobile */}
            {isMobile && timeLeft && (
              <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.35rem',
                  background: 'rgba(255,255,255,0.04)',
                  padding: '0.2rem 0.5rem',
                  borderRadius: 9999,
                  border: '1px solid rgba(255,255,255,0.06)',
                  flexShrink: 1,
                  minWidth: 0,
                  overflow: 'hidden'
              }}>
                  <Timer className="w-3 h-3 text-amber-400 shrink-0" />
                  <div style={{ 
                      display: 'flex', gap: '0.15rem', fontFamily: 'monospace', 
                      fontSize: '0.65rem', color: '#fff', whiteSpace: 'nowrap' 
                  }}>
                      <span>{String(timeLeft.days).padStart(2, '0')}d</span>
                      <span style={{ opacity: 0.3 }}>:</span>
                      <span>{String(timeLeft.hours).padStart(2, '0')}h</span>
                      <span style={{ opacity: 0.3 }}>:</span>
                      <span>{String(timeLeft.minutes).padStart(2, '0')}m</span>
                      <span style={{ opacity: 0.3 }}>:</span>
                      <span style={{ color: 'var(--gold)' }}>{String(timeLeft.seconds).padStart(2, '0')}s</span>
                  </div>
              </div>
            )}

            {!isMobile && (
              <ul className="rc-nav-links" style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', listStyle: 'none' }}>
                {NAV_LINKS.map(link => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      style={{
                        fontFamily: 'var(--font-ui)',
                        fontSize: '0.875rem',
                        color: 'rgba(255,255,255,0.6)',
                        fontWeight: 500,
                        letterSpacing: '0.02em',
                        transition: 'color 0.2s',
                        textTransform: 'uppercase',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}

            {!isMobile ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                <a
                  href="/auth"
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.85rem',
                    color: 'rgba(255,255,255,0.7)',
                    fontWeight: 600,
                    transition: 'color 0.2s',
                    marginRight: '0.5rem',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
                >
                  Sign In
                </a>
                <a
                  href="#experiences"
                  className="rc-nav-links btn-gold"
                  style={{
                    padding: '0.6rem 1.4rem',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    borderRadius: 9999,
                  }}
                >
                  Start Chatting ✦
                </a>
              </div>
            ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <a href="/auth" style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Sign In</a>
                    <button
                        className="rc-nav-mobile-toggle"
                        onClick={() => setMenuOpen(!menuOpen)}
                        style={{
                            width: 36, height: 36, borderRadius: 8,
                            border: '1px solid rgba(255,255,255,0.12)',
                            background: 'rgba(255,255,255,0.05)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px',
                        }}
                    >
                        {[0, 1, 2].map(i => (
                            <span key={i} style={{ display: 'block', width: 16, height: 2, background: '#fff', borderRadius: 1 }} />
                        ))}
                    </button>
                </div>
            )}

        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{
            borderTop: '1px solid rgba(255,179,0,0.15)',
            background: 'rgba(10,10,15,0.98)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            padding: '1.25rem 1.5rem 1.75rem',
          }}>
            {NAV_LINKS.map(link => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'block',
                  padding: '0.875rem 0',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.8)',
                  fontFamily: 'var(--font-ui)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {link.label}
              </a>
            ))}
            <a
              href="#experiences"
              className="btn-gold"
              onClick={() => setMenuOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '0.5rem', marginTop: '1.25rem', width: '100%',
              }}
            >
              Start Chatting ✦
            </a>
          </div>
        )}
      </nav>
    </>
  )
}
