'use client'
import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, BarChart3, Users, Zap, ArrowUpRight, TrendingUp } from 'lucide-react'

export default function AdminStats() {
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        totalEvents: 0,
        uniqueUsers: 0,
        topPersona: 'Loading...',
        topCategory: 'Loading...',
        recentEvents: [] as any[]
    })

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/admin/stats')
            const data = await res.json()
            setStats(data)
            setLoading(false)
        } catch (e) {
            console.error("Stats fetch failed")
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStats()
        // Refresh every 30 seconds
        const interval = setInterval(fetchStats, 30000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#050508',
            color: '#fff',
            padding: '3rem 2rem',
            fontFamily: 'var(--font-ui)',
        }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                
                {/* Header */}
                <header style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <div style={{ color: '#FFB300', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '0.5rem' }}>
                            Internal System
                        </div>
                        <h1 style={{ fontSize: '3rem', fontWeight: 300, letterSpacing: '-0.02em', margin: 0 }}>
                            Admin <span style={{ fontWeight: 600 }}>Command</span>
                        </h1>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ padding: '0.75rem 1.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,179,0,0.2)', borderRadius: '12px', fontSize: '0.85rem' }}>
                            <span style={{ color: loading ? '#FFB300' : '#00C896', marginRight: '0.5rem' }}>●</span> 
                            {loading ? 'Connecting...' : 'Live MongoDB Sync'}
                        </div>
                    </div>
                </header>

                {/* Grid Metrics */}
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                    gap: '2rem',
                    marginBottom: '4rem'
                }}>
                    <MetricCard 
                        title="Total Interactions" 
                        value={stats.totalEvents?.toLocaleString() || '0'} 
                        icon={<Activity size={24} />} 
                        trend="+100% (Real)"
                        accent="#FFB300"
                    />
                    <MetricCard 
                        title="Unique Pilots" 
                        value={stats.uniqueUsers?.toLocaleString() || '0'} 
                        icon={<Users size={24} />} 
                        trend="Active DB"
                        accent="#00C896"
                    />
                    <MetricCard 
                        title="Top Companion" 
                        value={stats.topPersona} 
                        icon={<Zap size={24} />} 
                        trend="Trending 🔥"
                        accent="#F43F5E"
                    />
                    <MetricCard 
                        title="Hot Category" 
                        value={stats.topCategory} 
                        icon={<TrendingUp size={24} />} 
                        trend="Dominating"
                        accent="#6366F1"
                    />
                </div>

                {/* Main Activity Area */}
                <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gap: '2rem'
                }}>
                    {/* Live Stream */}
                    <div style={{ 
                        background: '#0B0B14', 
                        border: '1px solid rgba(255,255,255,0.05)', 
                        borderRadius: '24px',
                        padding: '2rem'
                    }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <BarChart3 size={20} color="#FFB300" /> Recent Database Activity
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {stats.recentEvents?.length > 0 ? stats.recentEvents.map((ev: any, i: number) => (
                                <EventItem key={i} time={ev.time} event={ev.event} user={ev.user} details={ev.details} />
                            )) : (
                                <div style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '2rem' }}>
                                    No live activity detected in MongoDB yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @font-face { font-family: 'Inter'; src: url('https://fonts.googleapis.com/css2?family=Inter:wght@300;500;700;800&display=swap'); }
            `}} />
        </div>
    )
}

function MetricCard({ title, value, icon, trend, accent }: any) {
    return (
        <motion.div 
            whileHover={{ y: -5 }}
            style={{
                background: '#0B0B14',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '24px',
                padding: '2rem',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <div style={{ color: accent, marginBottom: '1.5rem' }}>{icon}</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
                {title}
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 300, marginBottom: '0.75rem' }}>{value}</div>
            <div style={{ color: '#00C896', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <ArrowUpRight size={14} /> {trend}
            </div>
            {/* Ambient Background Glow */}
            <div style={{
                position: 'absolute', top: '-20%', right: '-20%', width: '100px', height: '100px',
                background: accent, filter: 'blur(60px)', opacity: 0.05
            }} />
        </motion.div>
    )
}

function EventItem({ time, event, user, details }: any) {
    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '1rem', 
            background: 'rgba(255,255,255,0.02)', 
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '16px',
            fontSize: '0.9rem'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', width: '60px' }}>{time}</div>
                <div>
                    <span style={{ fontWeight: 600, color: '#FFB300' }}>{event}</span>
                    <span style={{ color: 'rgba(255,255,255,0.4)', margin: '0 0.5rem' }}>by</span>
                    <span style={{ color: '#fff' }}>{user}</span>
                </div>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>{details}</div>
        </div>
    )
}
