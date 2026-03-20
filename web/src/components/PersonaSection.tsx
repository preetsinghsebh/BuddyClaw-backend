'use client'
import { getTelegramLink } from "@/lib/telegram";
import React, { useState, useEffect, useRef } from 'react'
import { PERSONAS, PersonaData, SAFE_SPACE_LOCALIZATION, Message } from "@/lib/personas";
import { useAnalytics } from "@/hooks/useAnalytics";

// --- SVGs ---
const BackIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
    </svg>
)

const SendIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
)

// Note: Using the exported PERSONAS from lib/personas for single source of truth
const PERSONAS_BASE = PERSONAS;

export default function PersonaSection() {
    const [userCountry, setUserCountry] = useState<string | null>(null);
    const { trackEvent } = useAnalytics();

    useEffect(() => {
        fetch('https://api.country.is')
            .then(res => res.json())
            .then(data => setUserCountry(data.country))
            .catch(() => setUserCountry('US'));
    }, []);

    const localizedPersonas = React.useMemo(() => {
        if (!userCountry || userCountry === 'IN') return PERSONAS_BASE;

        return PERSONAS_BASE.map((p: PersonaData) => {
            const loc = SAFE_SPACE_LOCALIZATION[p.id as keyof typeof SAFE_SPACE_LOCALIZATION];
            if (loc) {
                return { ...p, name: loc.Global };
            }
            return p;
        });
    }, [userCountry]);

    const [activeId, setActiveId] = useState(PERSONAS_BASE[0].id)
    const [selectedCategory, setSelectedCategory] = useState<'For You ✨' | 'Love & Drama 💔' | 'Safe Space 🫂' | 'Anime Mode 🌸' | 'Chaos Mode 🔥' | 'Mind Reset 🌿' | 'Celeb Energy'>('For You ✨')

    const handleCategoryChange = (cat: any) => {
        setSelectedCategory(cat);
        trackEvent('category_switch', { category: cat });
    };
    const [mobileView, setMobileView] = useState<'list' | 'chat'>('list') // For mobile sliding
    const [windowWidth, setWindowWidth] = useState(1200)

    const CATEGORIES = ['For You ✨', 'Love & Drama 💔', 'Safe Space 🫂', 'Chaos Mode 🔥', 'Anime Mode 🌸', 'Mind Reset 🌿', 'Celeb Energy']

    const filteredPersonas = localizedPersonas.filter(p => 
            selectedCategory === 'For You ✨' || p.category === selectedCategory
        )
const activeP = localizedPersonas.find(p => p.id === activeId) || localizedPersonas[0]

    // Chat animation state
    const [visibleMsgs, setVisibleMsgs] = useState<Message[]>([])
    const [isTyping, setIsTyping] = useState(false)
    const chatEndRef = useRef<HTMLDivElement>(null)

    // Handle responsive window width
    useEffect(() => {
        setWindowWidth(window.innerWidth)
        const handleResize = () => setWindowWidth(window.innerWidth)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])
    
    const isMobile = windowWidth < 768

    // Handle chat playback simulation
    useEffect(() => {
        let timeouts: NodeJS.Timeout[] = []
        setVisibleMsgs([])
        setIsTyping(false)

        let cumulativeDelay = 0;
        
        activeP.messages.forEach((msg, i) => {
            cumulativeDelay += msg.delayMs;
            
            // Show typing indicator a bit before the bot message drops
            if (msg.sender === 'bot') {
                timeouts.push(setTimeout(() => {
                    setIsTyping(true)
                }, cumulativeDelay - 800 > 0 ? cumulativeDelay - 800 : 0))
            }

            // Drop the message
            timeouts.push(setTimeout(() => {
                setIsTyping(false)
                setVisibleMsgs(prev => [...prev, msg])
            }, cumulativeDelay))
        })

        return () => {
            timeouts.forEach(clearTimeout)
        }
    }, [activeId, activeP])

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [visibleMsgs, isTyping])

    return (
        <section id="experiences" style={{ backgroundColor: '#05050A', padding: '6rem 0', position: 'relative', overflow: 'hidden' }}>
            {/* Background ambient glow */}
            <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0,
                background: 'radial-gradient(circle at 50% 50%, rgba(255, 179, 0, 0.03) 0%, transparent 60%)'
            }} />

            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1rem', position: 'relative', zIndex: 1 }}>
                
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        background: 'rgba(255,179,0,0.1)', border: '1px solid rgba(255,179,0,0.25)',
                        borderRadius: 9999, padding: '0.35rem 1rem', marginBottom: '1.5rem',
                    }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#FFB300', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                            Interactive Discovery
                        </span>
                    </div>
                    <h2 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', color: '#fff', lineHeight: 1.1, fontWeight: 300, marginBottom: '1rem' }}>
                        Who do you want to <span style={{ color: '#FFB300', fontWeight: 500 }}>talk</span> to?
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem', maxWidth: 500, margin: '0 auto' }}>
                        Skip the boring descriptions. Dive straight into a conversation and see if the vibe matches.
                    </p>
                </div>

                {/* Inbox Container */}
                <div style={{
                    display: 'flex',
                    background: '#0B0B12',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 24,
                    height: 600,
                    overflow: 'hidden',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                }}>
                    
                    {/* LEFT PANE: Sidebar List */}
                    <div style={{
                        flex: isMobile ? (mobileView === 'chat' ? '0' : '1') : '0 0 320px',
                        width: isMobile ? '100%' : '320px',
                        borderRight: isMobile ? 'none' : '1px solid rgba(255,255,255,0.08)',
                        display: isMobile && mobileView === 'chat' ? 'none' : 'flex',
                        flexDirection: 'column',
                        background: '#101018',
                    }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                Messages
                                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>Swipe to explore →</span>
                            </h3>

                            {/* Category Tabs */}
                            <div style={{ position: 'relative' }}>
                                <div style={{ 
                                    display: 'flex', 
                                    gap: '0.5rem', 
                                    overflowX: 'auto', 
                                    paddingBottom: '0.5rem',
                                    paddingRight: '2.5rem', // Added padding to help clip the last visible item
                                    scrollbarWidth: 'none',
                                    msOverflowStyle: 'none'
                                }} className="hide-scrollbar">
                                    {CATEGORIES.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => handleCategoryChange(cat as any)}
                                            style={{
                                                padding: '0.4rem 0.8rem',
                                                borderRadius: '8px',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                whiteSpace: 'nowrap',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                background: selectedCategory === cat ? 'rgba(255,179,0,0.15)' : 'rgba(255,255,255,0.03)',
                                                color: selectedCategory === cat ? '#FFB300' : 'rgba(255,255,255,0.5)',
                                                border: `1px solid ${selectedCategory === cat ? 'rgba(255,179,0,0.3)' : 'rgba(255,255,255,0.05)'}`,
                                            }}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                                {/* Right Scroll Indicator Arrow */}
                                <div style={{
                                    position: 'absolute',
                                    right: 0,
                                    top: 0,
                                    bottom: '0.5rem',
                                    width: '40px',
                                    background: 'linear-gradient(to right, transparent, #101018)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'flex-end',
                                    pointerEvents: 'none',
                                    paddingRight: '4px'
                                }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFB300" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}>
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        
                        <div style={{ flex: 1, overflowY: 'auto' }} className="custom-scrollbar">
                            {filteredPersonas.map(p => {
                                const isActive = p.id === activeId;
                                return (
                                    <div 
                                        key={p.id}
                                        onClick={() => {
                                            setActiveId(p.id)
                                            trackEvent('persona_select', { personaId: p.id, category: p.category });
                                            if (isMobile) setMobileView('chat')
                                        }}
                                        style={{
                                            padding: '1rem 1.25rem',
                                            display: 'flex',
                                            gap: '1rem',
                                            cursor: 'pointer',
                                            background: isActive ? 'rgba(255,255,255,0.04)' : 'transparent',
                                            borderLeft: `3px solid ${isActive ? p.accent : 'transparent'}`,
                                            transition: 'background 0.2s',
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isActive) e.currentTarget.style.background = 'transparent'
                                        }}
                                    >
                                        <div style={{
                                            width: 48, height: 48, borderRadius: '50%',
                                            background: `${p.accent}20`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '1.5rem', flexShrink: 0,
                                            position: 'relative',
                                            overflow: 'hidden',
                                        }}>
                                            {p.imageUrl ? (
                                                <img 
                                                    src={p.imageUrl} 
                                                    alt={p.name} 
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: p.objectPosition || 'center 15%' }}
                                                />
                                            ) : (
                                                p.icon
                                            )}
                                            {isActive && (
                                                <span style={{ position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, background: '#00C896', borderRadius: '50%', border: '2px solid #101018', zIndex: 10 }} />
                                            )}
                                        </div>
                                        <div style={{ overflow: 'hidden', flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                <span style={{ color: '#fff', fontWeight: isActive ? 600 : 500, fontSize: '0.95rem' }}>
                                                    {p.name} <span style={{ opacity: 0.6, fontSize: '0.85em', fontWeight: 400 }}>({p.tag})</span>
                                                </span>
                                                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem' }}>Now</span>
                                            </div>
                                            <div style={{ color: isActive ? p.accent : 'rgba(255,255,255,0.4)', fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {p.messages[p.messages.length - 1].text}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* RIGHT PANE: Active Chat */}
                    <div style={{
                        flex: 1,
                        display: isMobile && mobileView === 'list' ? 'none' : 'flex',
                        flexDirection: 'column',
                        background: activeP.bgGrad,
                        position: 'relative',
                    }}>
                        
                        {/* Chat Header */}
                        <div style={{
                            padding: '1.25rem 1.5rem',
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex', alignItems: 'center', gap: '1rem',
                            background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(10px)',
                            zIndex: 10,
                        }}>
                            {isMobile && (
                                <button onClick={() => setMobileView('list')} style={{ background: 'none', border: 'none', color: '#fff', padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                    <BackIcon />
                                </button>
                            )}

                            <div style={{ width: 44, height: 44, borderRadius: '50%', background: `${activeP.accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                                {activeP.icon}
                            </div>
                            <div>
                                <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 600, margin: 0, lineHeight: 1.2 }}>
                                    {activeP.name} <span style={{ opacity: 0.6, fontWeight: 400, fontSize: '0.85em' }}>({activeP.tag})</span>
                                </h3>
                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                    <span style={{ color: '#00C896', fontSize: '0.6rem' }}>●</span> Active
                                </div>
                            </div>
                        </div>

                        {/* Chat Body */}
                        <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }} className="custom-scrollbar">
                            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Today 3:42 AM
                            </div>

                            {visibleMsgs.map((m, i) => {
                                const isMe = m.sender === 'user'
                                return (
                                    <div key={i} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: '8px', animation: 'fadeInUp 0.3s ease-out forwards' }}>
                                        {!isMe && (
                                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${activeP.accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', flexShrink: 0 }}>
                                                {activeP.icon}
                                            </div>
                                        )}
                                        <div style={{
                                            background: isMe ? activeP.accent : 'rgba(255,255,255,0.08)',
                                            color: isMe ? '#fff' : 'rgba(255,255,255,0.9)',
                                            padding: '0.75rem 1rem',
                                            borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                            maxWidth: '75%',
                                            fontSize: '0.9rem',
                                            lineHeight: 1.4,
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        }}>
                                            {m.text}
                                        </div>
                                    </div>
                                )
                            })}

                            {isTyping && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.7, animation: 'fadeIn 0.2s ease-out forwards' }}>
                                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${activeP.accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                                        {activeP.icon}
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.8rem 1rem', borderRadius: '18px 18px 18px 4px', display: 'flex', gap: '4px' }}>
                                        <span className="dot" style={{ width: 6, height: 6, background: '#fff', borderRadius: '50%', animation: 'bounce 1s infinite alternate' }} />
                                        <span className="dot" style={{ width: 6, height: 6, background: '#fff', borderRadius: '50%', animation: 'bounce 1s infinite alternate', animationDelay: '0.2s' }} />
                                        <span className="dot" style={{ width: 6, height: 6, background: '#fff', borderRadius: '50%', animation: 'bounce 1s infinite alternate', animationDelay: '0.4s' }} />
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Custom CSS for animations embedded safely */}
                        <style dangerouslySetInnerHTML={{__html: `
                            @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                            @keyframes bounce { 0% { transform: translateY(0); } 100% { transform: translateY(-4px); } }
                            .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                            .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
                            .hide-scrollbar::-webkit-scrollbar { display: none; }
                        `}} />

                        {/* Chat Footer CTA */}
                             <a
                                href={`/auth?personaId=${activeP.id}`}
                                onClick={() => trackEvent('telegram_chat_start', { personaId: activeP.id, category: activeP.category })}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                    background: activeP.accent,
                                    color: '#fff',
                                    textDecoration: 'none',
                                    padding: '1rem',
                                    borderRadius: 16,
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    transition: 'all 0.2s ease',
                                    boxShadow: `0 8px 25px ${activeP.accent}40`,
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <SendIcon /> Talk to {activeP.name} on Telegram
                            </a>
                    </div>

                </div>
            </div>
        </section>
    )
}
