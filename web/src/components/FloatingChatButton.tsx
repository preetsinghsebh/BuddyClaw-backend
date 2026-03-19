'use client'

export default function FloatingChatButton() {
    return (
        <a
            href="#experiences"
            aria-label="Chat Now"
            style={{
                position: 'fixed',
                bottom: '1.75rem',
                right: '1.75rem',
                zIndex: 999,
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                background: 'rgba(255, 122, 0, 0.15)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                color: '#fff',
                fontFamily: 'var(--font-ui)',
                fontWeight: 800,
                fontSize: '0.75rem',
                padding: '0.8rem 1.6rem',
                borderRadius: 9999,
                border: '1px solid rgba(255, 122, 0, 0.3)',
                boxShadow: '0 8px 32px rgba(255, 122, 0, 0.2), inset 0 0 12px rgba(255, 122, 0, 0.1)',
                cursor: 'pointer',
                textDecoration: 'none',
                transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
                whiteSpace: 'nowrap',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
            }}
            onMouseEnter={e => {
                const target = e.currentTarget as HTMLAnchorElement;
                target.style.transform = 'scale(1.05) translateY(-4px)';
                target.style.background = 'rgba(255, 122, 0, 0.25)';
                target.style.borderColor = 'rgba(255, 122, 0, 0.5)';
            }}
            onMouseLeave={e => {
                const target = e.currentTarget as HTMLAnchorElement;
                target.style.transform = 'scale(1) translateY(0)';
                target.style.background = 'rgba(255, 122, 0, 0.15)';
                target.style.borderColor = 'rgba(255, 122, 0, 0.3)';
            }}
        >
            <span style={{ fontSize: '0.9rem', color: 'var(--gold)' }}>✦</span>
            Chat Now
        </a>
    )
}
