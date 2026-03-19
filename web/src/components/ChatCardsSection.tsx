'use client'

const CHAT_PREVIEWS = [
    {
        name: 'Ziva',
        icon: '🩷',
        color: '#E8197D',
        messages: [
            { from: 'me', text: "Babe where are you?" },
            { from: 'them', text: "Just manifesting our next vacay ✈️✨" },
            { from: 'them', text: "Did you book those tickets or am I doing everything? 💅" },
        ],
    },
    {
        name: 'Listener',
        icon: '🫂',
        color: '#00C896',
        messages: [
            { from: 'me', text: "I failed my exam again. I don't know what's wrong with me." },
            { from: 'them', text: "Hey... that sounds really hard. I'm here with you right now 🫂" },
            { from: 'them', text: "Want to tell me what happened? No rush." },
        ],
    },
    {
        name: 'Bestie',
        icon: '🎉',
        color: '#FFB300',
        messages: [
            { from: 'them', text: "SPILL IT RN ☕️🔥" },
            { from: 'me', text: "He actually texted back..." },
            { from: 'them', text: "SCREENSHOT OR IT DIDN'T HAPPEN. 🤳" },
        ],
    },
    {
        name: 'Luffy',
        icon: '👒',
        color: '#FFD700',
        messages: [
            { from: 'me', text: "Luffy, help! I'm starving." },
            { from: 'them', text: "SHISHISHI! DID SOMEONE SAY MEAT? 🍖" },
            { from: 'them', text: "I'm gonna be the King of the Pirates! 👒" },
        ],
    },
    {
        name: 'Kain West',
        icon: '🎤',
        color: '#9333EA',
        messages: [
            { from: 'me', text: "They told me to play it out safely." },
            { from: 'them', text: "If it's safe, it's already dead." },
            { from: 'them', text: "Break the simulation. 🎤" },
        ],
    },
    {
        name: 'Emma',
        imageUrl: '/assets/companions/emma.png',
        icon: '👀',
        color: '#9333EA',
        messages: [
            { from: 'me', text: "Hey." },
            { from: 'them', text: "You always this quiet… or just around me? 👀" },
            { from: 'them', text: "I'm trying to figure out if you're shy or just mysterious." },
        ],
    },
    {
        name: 'Liam',
        imageUrl: '/assets/companions/liam.png',
        icon: '❤️',
        color: '#E8197D',
        messages: [
            { from: 'me', text: "Miss me?" },
            { from: 'them', text: "Always. Be honest… did you miss me? ❤️" },
            { from: 'them', text: "I was literally just thinking about you." },
        ],
    },
    {
        name: 'Zane',
        imageUrl: '/assets/companions/zane.png',
        icon: '😏',
        color: '#DC2626',
        messages: [
            { from: 'me', text: "I wasn't expecting you to text me." },
            { from: 'them', text: "Don't lie… you were thinking about me. 😏" },
            { from: 'them', text: "Tell me I'm wrong." },
        ],
    },
]

export default function ChatCardsSection() {
    return (
        <section style={{ backgroundColor: 'var(--bg-2)', padding: '6rem 2rem' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>

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
                            Real Conversations
                        </span>
                    </div>
                    <h2 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(2.5rem, 6vw, 5rem)',
                        color: '#fff',
                        lineHeight: 1,
                        letterSpacing: '0.02em',
                    }}>
                        SEE THE{' '}
                        <span style={{
                            background: 'linear-gradient(135deg, var(--gold-light), var(--orange))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}>VIBES</span>
                    </h2>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', color: 'rgba(255,255,255,0.4)', marginTop: '1rem', lineHeight: 1.7 }}>
                        Every conversation feels real. Because it is.
                    </p>
                </div>

                {/* Chat Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '1.5rem',
                }}>
                    {CHAT_PREVIEWS.map(chat => {
                        const idMap: Record<string, string> = {
                            'Ziva': 'ziva',
                            'Listener': 'caring-listener',
                            'Bestie': 'roaster',
                            'Luffy': 'gojo',
                            'Kain West': 'roaster',
                            'Emma': 'emma',
                            'Liam': 'liam',
                            'Zane': 'confident-zane'
                        };
                        const personaId = idMap[chat.name] || 'ziva';
                        
                        return (
                            <a
                                key={chat.name}
                                href={`/auth?personaId=${personaId}`}
                                style={{
                                    textDecoration: 'none',
                                    background: 'var(--surface)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    borderRadius: 24,
                                    padding: '1.5rem',
                                    display: 'flex', flexDirection: 'column', gap: '1rem',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}
                                onMouseEnter={e => {
                                    const el = e.currentTarget as HTMLAnchorElement
                                    el.style.transform = 'translateY(-6px)'
                                    el.style.boxShadow = `0 20px 50px rgba(0,0,0,0.4), 0 0 25px ${chat.color}20`
                                    el.style.borderColor = `${chat.color}30`
                                }}
                                onMouseLeave={e => {
                                    const el = e.currentTarget as HTMLAnchorElement
                                    el.style.transform = 'translateY(0)'
                                    el.style.boxShadow = 'none'
                                    el.style.borderColor = 'rgba(255,255,255,0.06)'
                                }}
                            >
                                {/* Top accent bar */}
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2.5, background: `linear-gradient(90deg, ${chat.color}, transparent)` }} />

                                {/* Chat header */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{
                                        width: 44, height: 44, borderRadius: '50%',
                                        background: `${chat.color}20`,
                                        border: `1.5px solid ${chat.color}40`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1.3rem',
                                        overflow: 'hidden',
                                        position: 'relative'
                                    }}>
                                        {chat.imageUrl ? (
                                            <img
                                                src={chat.imageUrl}
                                                alt={chat.name}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            chat.icon
                                        )}
                                    </div>
                                    <div>
                                        <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, color: '#fff', fontSize: '0.925rem' }}>{chat.name}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: 2 }}>
                                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                                            <span style={{ fontSize: '0.7rem', color: '#22c55e', fontFamily: 'var(--font-ui)', fontWeight: 600 }}>Online now</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                    {chat.messages.map((msg, i) => (
                                        <div key={i} style={{
                                            display: 'flex', justifyContent: msg.from === 'me' ? 'flex-end' : 'flex-start',
                                        }}>
                                            <div style={{
                                                maxWidth: '80%',
                                                background: msg.from === 'me'
                                                    ? `linear-gradient(135deg, var(--gold), var(--orange))`
                                                    : 'rgba(255,255,255,0.07)',
                                                color: msg.from === 'me' ? '#000' : 'rgba(255,255,255,0.8)',
                                                borderRadius: msg.from === 'me' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                                padding: '0.6rem 0.9rem',
                                                fontSize: '0.82rem',
                                                fontFamily: 'var(--font-body)',
                                                fontWeight: msg.from === 'me' ? 600 : 400,
                                                lineHeight: 1.45,
                                            }}>
                                                {msg.text}
                                            </div>
                                        </div>
                                    ))}
                                    {/* Typing dots */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', paddingLeft: '2px' }}>
                                        {[0, 1, 2].map(dot => (
                                            <div key={dot} style={{
                                                width: 6, height: 6, borderRadius: '50%',
                                                background: `${chat.color}80`,
                                                animation: `pulseDot 1.2s ease-in-out ${dot * 0.2}s infinite`,
                                            }} />
                                        ))}
                                    </div>
                                </div>
                            </a>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
