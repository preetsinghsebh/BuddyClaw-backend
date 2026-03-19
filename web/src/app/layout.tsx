import type { Metadata } from 'next'
import './globals.css'
import DisclaimerModal from '@/components/DisclaimerModal'

export const metadata: Metadata = {
  title: 'DostAI — Your People Found You',
  description: 'Anime legends. Real-life icons. Healing guides. Hype squads. Every friend you\'ve ever needed — all in one place on Telegram.',
  openGraph: {
    title: 'DostAI — Your People Found You',
    description: 'Anime legends. Real-life icons. Healing guides. Hype squads. Find your circle.',
    type: 'website',
    images: [{ url: '/hero-exact.png', width: 1200, height: 630, alt: 'DostAI' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DostAI — Your People Found You',
    description: 'Find your circle. Anime legends, real-life icons, healing guides & hype squads — on Telegram.',
    images: ['/hero-exact.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#FFB300" />
      </head>
      <body>
        <DisclaimerModal />
        {children}
      </body>
    </html>
  )
}
