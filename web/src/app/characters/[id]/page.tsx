
import { Metadata } from 'next';
import { PERSONAS } from '@/lib/personas';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getTelegramLink } from '@/lib/telegram';
import { ArrowLeft, MessageCircle, Sparkles, Shield } from 'lucide-react';

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const persona = PERSONAS.find(p => p.id === params.id);
  
  if (!persona) return { title: 'Character Not Found' };

  return {
    title: `Chat with ${persona.name} on BuddyClaw`,
    description: persona.description || `Chat with ${persona.name}, your personalized AI companion.`,
    openGraph: {
      images: [persona.imageUrl || ''],
    },
  };
}

export default function CharacterPage({ params }: Props) {
  const persona = PERSONAS.find(p => p.id === params.id);

  if (!persona) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#05050A] text-white selection:bg-[#FFB300]/30">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[150px] opacity-20"
            style={{ backgroundColor: persona.accent }}
          />
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-[#FFB300] transition-colors mb-12 uppercase text-xs font-bold tracking-widest">
           <ArrowLeft className="w-4 h-4" /> Back to Discovery
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Visual Column */}
            <div className="relative aspect-[4/5] md:aspect-square group transition-all duration-700">
                <div className="absolute inset-0 bg-gradient-to-t from-[#05050A] via-transparent to-transparent z-10" />
                <div className="absolute -inset-4 bg-[#FFB300]/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <div className="relative w-full h-full rounded-[40px] overflow-hidden border border-white/10">
                    <Image 
                        src={persona.imageUrl || ''} 
                        alt={persona.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-[2s]"
                        style={{ objectPosition: persona.objectPosition || 'center' }}
                    />
                </div>
            </div>

            {/* Content Column */}
            <div className="space-y-8">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1 bg-white/5 border border-white/10 rounded-full">
                        <span className="text-xl">{persona.icon}</span>
                        <span className="text-xs uppercase tracking-[0.2em] font-bold text-white/40">{persona.category}</span>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-medium tracking-tighter">
                        {persona.name}
                    </h1>
                    <p className="text-xl md:text-2xl font-light text-white/60 leading-relaxed">
                        {persona.description}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                        <div className="text-[#FFB300] mb-2"><Sparkles className="w-5 h-5" /></div>
                        <div className="text-sm font-medium uppercase tracking-widest text-white/30 mb-1">Archetype</div>
                        <div className="text-lg">{persona.tag}</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                        <div className="text-blue-400 mb-2"><Shield className="w-5 h-5" /></div>
                        <div className="text-sm font-medium uppercase tracking-widest text-white/30 mb-1">Safety</div>
                        <div className="text-lg">Verified</div>
                    </div>
                </div>

                <div className="pt-8">
                    <a 
                        href={getTelegramLink(persona.id)} 
                        target="_blank"
                        className="w-full md:w-auto inline-flex items-center justify-center gap-4 px-12 py-6 bg-[#FFB300] text-[#05050A] rounded-[30px] font-bold text-xl hover:scale-105 active:scale-95 transition-all shadow-[0_20px_50px_rgba(255,179,0,0.3)] group"
                    >
                        <MessageCircle className="w-6 h-6 fill-current" />
                        START CONVERSATION
                        <Sparkles className="w-5 h-5 animate-pulse" />
                    </a>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
