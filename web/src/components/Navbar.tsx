'use client'
import { useState, useEffect } from 'react'

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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)

    checkMobile()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', checkMobile)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  return (
    <>
      <nav style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 1000,
        backgroundColor: isMobile ? 'transparent' : (scrolled ? 'rgba(10, 10, 15, 0.95)' : 'rgba(10, 10, 15, 0.4)'),
        backdropFilter: isMobile ? 'none' : 'blur(16px)',
        WebkitBackdropFilter: isMobile ? 'none' : 'blur(16px)',
        borderBottom: (!isMobile && scrolled) ? '1px solid rgba(255,179,0,0.15)' : '1px solid transparent',
        transition: 'all 0.4s ease',
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 1.5rem',
          height: 68,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}>

          {/* Logo */}
          <a href="#" style={{
            fontFamily: 'var(--font-ui)',
            fontWeight: 600,
            fontSize: '1.4rem',
            letterSpacing: '-0.02em',
            color: '#fff',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            display: isMobile ? 'none' : 'flex',
            alignItems: 'center',
            gap: '0.6rem',
          }}>
            <div style={{
              width: 24, height: 24,
              background: 'linear-gradient(135deg, #fff 0%, #ccc 100%)',
              borderRadius: '50%',
              opacity: 0.9
            }} />
            DostAI
          </a>

          {/* Desktop Nav links */}
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

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
            {/* Sign In */}
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

            {/* CTA */}
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

            {/* Hamburger */}
            <button
              className="rc-nav-mobile-toggle"
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                width: 40, height: 40, borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.05)',
                flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '5px',
                display: 'none',
              }}
              aria-label="Menu"
            >
              {[0, 1, 2].map(i => (
                <span key={i} style={{ display: 'block', width: 18, height: 2, background: '#fff', borderRadius: 1 }} />
              ))}
            </button>
          </div>
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
