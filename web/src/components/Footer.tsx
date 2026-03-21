'use client'
import Image from 'next/image'

const FOOTER_COLS = [
    {
        title: 'CIRCLE',
        links: [
            { label: 'How It Works', href: '#how-it-works' },
            { label: 'Features', href: '#features' },
        ],
    },
    {
        title: 'CONNECT',
        links: [
            { label: 'Start on Telegram', href: '/auth' },
            { label: 'FAQ', href: '#faq' },
        ],
    },
    {
        title: 'LEGAL',
        links: [
            { label: 'Privacy Policy', href: '/privacy' },
            { label: 'Terms of Service', href: '/terms' },
        ],
    },
]


export default function Footer() {
    return (
        <footer style={{
            backgroundColor: '#050508',
            borderTop: '1px solid rgba(255,179,0,0.1)',
            padding: '4.5rem 2rem 2rem',
        }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>

                {/* Top row */}
                <div className="footer-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '3rem',
                    marginBottom: '3.5rem',
                    alignItems: 'start',
                }}>

                    {/* Brand */}
                    <div>
                        <div style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '2.4rem',
                            letterSpacing: '-0.02em',
                            color: '#fff',
                            fontWeight: 300,
                        }}>
                            Buddy<span style={{ color: 'var(--gold)', opacity: 0.9 }}>Claw</span>
                        </div>
                        <p style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '0.875rem',
                            color: 'rgba(255,255,255,0.35)',
                            lineHeight: 1.7,
                            maxWidth: 280,
                        }}>
                            Your circle, always online. From anime legends to life guides, find the friend you need — stay authentic, stay connected.
                        </p>
                    </div>

                    {/* Nav columns */}
                    {FOOTER_COLS.map(col => (
                        <div key={col.title}>
                            <div style={{
                                fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.12em',
                                color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase',
                                marginBottom: '1.25rem', fontFamily: 'var(--font-ui)',
                            }}>{col.title}</div>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                                {col.links.map(link => (
                                    <li key={link.label}>
                                        <a
                                            href={link.href}
                                            target={link.href.startsWith('http') ? '_blank' : undefined}
                                            rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                                            style={{
                                                fontFamily: 'var(--font-ui)',
                                                fontSize: '0.875rem',
                                                color: 'rgba(255,255,255,0.45)',
                                                transition: 'color 0.2s',
                                            }}
                                            onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold)')}
                                            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
                                        >
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                </div>

                {/* Bottom bar */}
                <div style={{
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    paddingTop: '1.75rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                }}>
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'rgba(255,255,255,0.2)' }}>
                        © 2026 BuddyClaw. All rights reserved.
                    </span>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'rgba(255,179,0,0.35)', letterSpacing: '0.15em', fontWeight: 300 }}>
                        Stay hungry. Stay strong. ✦
                    </span>
                </div>
            </div>
        </footer>
    )
}
