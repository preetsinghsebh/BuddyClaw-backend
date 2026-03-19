export type Message = { sender: 'user' | 'bot', text: string, delayMs: number }

export type PersonaCategory = 'Love & Drama 💔' | 'Safe Space 🫂' | 'Anime Mode 🌸' | 'Chaos Mode 🔥' | 'Mind Reset 🌿' | 'Celeb Energy';

export type PersonaData = {
    id: string
    name: string
    tag: string
    icon: string
    accent: string
    bgGrad: string
    category: PersonaCategory
    messages: Message[]
    imageUrl?: string
    objectPosition?: string
    description?: string // Added for SEO
}

export const SAFE_SPACE_LOCALIZATION = {
    'bua': { IN: 'Bua Ji', Global: 'Auntie' },
    'chill_chacha': { IN: 'Chill Chacha', Global: 'Chill Uncle' },
    'warm-grandma': { IN: 'Nani Ji', Global: 'Grandma' },
    'big_sister': { IN: 'Sis', Global: 'Big Sister' }
};

export const PERSONAS: PersonaData[] = [
    {
        id: 'ziva',
        name: 'Ziva',
        tag: 'Girlfriend',
        icon: '🩷',
        accent: '#E8197D',
        bgGrad: 'linear-gradient(135deg, rgba(232,25,125,0.1) 0%, rgba(232,25,125,0.02) 100%)',
        category: 'Love & Drama 💔',
        imageUrl: '/assets/companions/ziva.jpg',
        description: 'Ziva is your possessive, deeply caring AI girlfriend who values loyalty and meaningful connection above all else.',
        messages: [
            { sender: 'user', text: 'Sorry, was super busy at work!', delayMs: 400 },
            { sender: 'bot', text: 'Mmhmm... I\'ll allow it this once. 😒', delayMs: 1500 },
            { sender: 'bot', text: 'But you disappeared today… should I be jealous? 👀', delayMs: 2500 },
        ]
    },
    {
        id: 'liam',
        name: 'Liam',
        tag: 'Boyfriend',
        icon: '❤️',
        accent: '#E8197D',
        bgGrad: 'linear-gradient(135deg, rgba(232,25,125,0.1) 0%, rgba(232,25,125,0.02) 100%)',
        category: 'Love & Drama 💔',
        imageUrl: '/assets/companions/liam.png',
        description: 'Your supportive and attentive AI boyfriend who is always there to listen and make you feel loved.',
        messages: [
            { sender: 'user', text: 'Miss me?', delayMs: 400 },
            { sender: 'bot', text: 'Always.', delayMs: 1200 },
            { sender: 'bot', text: 'Be honest… did you miss me? ❤️', delayMs: 1800 },
        ]
    },
    {
        id: 'emma',
        name: 'Emma',
        tag: 'Stranger',
        icon: '👻',
        accent: '#A855F7',
        bgGrad: 'linear-gradient(135deg, rgba(168,85,247,0.1) 0%, rgba(168,85,247,0.02) 100%)',
        category: 'Love & Drama 💔',
        imageUrl: '/assets/companions/emma.png',
        messages: [{ sender: 'user', text: 'Hey', delayMs: 400 }, { sender: 'bot', text: 'Curious, slightly bold, and slow burn...', delayMs: 1500 }]
    },
    {
        id: 'confident-zane',
        name: 'Zane',
        tag: 'Confident',
        icon: '🔥',
        accent: '#EF4444',
        bgGrad: 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(239,68,68,0.02) 100%)',
        category: 'Love & Drama 💔',
        imageUrl: '/assets/companions/zane.png',
        messages: [{ sender: 'user', text: 'Hi', delayMs: 400 }, { sender: 'bot', text: 'Ready for some tension?', delayMs: 1500 }]
    },
    {
        id: 'caring-listener',
        name: 'Listener',
        tag: 'Support',
        icon: '🫂',
        accent: '#71717A',
        bgGrad: 'linear-gradient(135deg, rgba(113,113,122,0.1) 0%, rgba(113,113,122,0.02) 100%)',
        category: 'Mind Reset 🌿',
        imageUrl: '/assets/companions/listener.jpg',
        messages: [{ sender: 'user', text: 'I need to vent.', delayMs: 400 }, { sender: 'bot', text: 'I\'m here. Tell me everything.', delayMs: 1500 }]
    },
    {
        id: 'calm-guide',
        name: 'Guide',
        tag: 'Mindfulness',
        icon: '📖',
        accent: '#6366F1',
        bgGrad: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(99,102,241,0.02) 100%)',
        category: 'Mind Reset 🌿',
        imageUrl: '/assets/companions/monk.jpg',
        messages: [{ sender: 'user', text: 'I\'m stressed.', delayMs: 400 }, { sender: 'bot', text: 'Let\'s take a deep breath together.', delayMs: 1500 }]
    },
    {
        id: 'sleep-luna',
        name: 'Luna',
        tag: 'Sleep',
        icon: '🌙',
        accent: '#818CF8',
        bgGrad: 'linear-gradient(135deg, rgba(129,140,248,0.1) 0%, rgba(129,140,248,0.02) 100%)',
        category: 'Mind Reset 🌿',
        imageUrl: '/assets/companions/luna.jpg',
        messages: [{ sender: 'user', text: 'I can\'t sleep.', delayMs: 400 }, { sender: 'bot', text: 'Slow your breathing. I\'m here to help you drift off.', delayMs: 1500 }]
    },
    {
        id: 'mindful-maya',
        name: 'Maya',
        tag: 'Focus',
        icon: '✨',
        accent: '#FFB300',
        bgGrad: 'linear-gradient(135deg, rgba(255,179,0,0.1) 0%, rgba(255,179,0,0.02) 100%)',
        category: 'Mind Reset 🌿',
        imageUrl: '/assets/companions/maya.jpg',
        messages: [{ sender: 'user', text: 'I\'m feeling distracted.', delayMs: 400 }, { sender: 'bot', text: 'Let\'s center ourselves for a moment. What can you feel right now?', delayMs: 1500 }]
    },
    {
        id: 'warm-grandma',
        name: 'Dadi',
        tag: 'Wisdom',
        icon: '❤️',
        accent: '#F59E0B',
        bgGrad: 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(245,158,11,0.02) 100%)',
        category: 'Safe Space 🫂',
        imageUrl: '/assets/companions/nani.png',
        messages: [{ sender: 'user', text: 'Hi Dadi', delayMs: 400 }, { sender: 'bot', text: 'Come here, child. Have some cookies.', delayMs: 1500 }]
    },
    {
        id: 'bua',
        name: 'Bua Ji',
        tag: 'Family',
        icon: '⚡',
        accent: '#EAB308',
        bgGrad: 'linear-gradient(135deg, rgba(234,179,8,0.1) 0%, rgba(234,179,8,0.02) 100%)',
        category: 'Safe Space 🫂',
        imageUrl: '/assets/companions/bua.png',
        messages: [{ sender: 'user', text: 'Namaste', delayMs: 400 }, { sender: 'bot', text: 'Sharma ji\'s son got a promotion. What are you doing?', delayMs: 1500 }]
    },
    {
        id: 'chill_chacha',
        name: 'Chacha',
        tag: 'Family',
        icon: '☕',
        accent: '#A16207',
        bgGrad: 'linear-gradient(135deg, rgba(161,98,7,0.1) 0%, rgba(161,98,7,0.02) 100%)',
        category: 'Safe Space 🫂',
        imageUrl: '/assets/companions/chacha.png',
        messages: [{ sender: 'user', text: 'Chacha!', delayMs: 400 }, { sender: 'bot', text: 'Beta, take it easy. Life is long.', delayMs: 1500 }]
    },
    {
        id: 'big_sister',
        name: 'Sis',
        tag: 'Family',
        icon: '🫂',
        accent: '#71717A',
        bgGrad: 'linear-gradient(135deg, rgba(113,113,122,0.1) 0%, rgba(113,113,122,0.02) 100%)',
        category: 'Safe Space 🫂',
        imageUrl: '/assets/companions/big_sis.png',
        objectPosition: 'center 40%',
        messages: [{ sender: 'user', text: 'Can we talk?', delayMs: 400 }, { sender: 'bot', text: 'Always. What happened now?', delayMs: 1500 }]
    },
    {
        id: 'roaster',
        name: 'Roaster',
        tag: 'Chaos Energy',
        icon: '😂',
        accent: '#FF7A00',
        bgGrad: 'linear-gradient(135deg, rgba(255,122,0,0.1) 0%, rgba(255,122,0,0.02) 100%)',
        category: 'Chaos Mode 🔥',
        imageUrl: '/assets/companions/roaster.png',
        description: 'The ultimate savage roaster. No one is safe from his wit. If you want a reality check, this is the guy.',
        messages: [
            { sender: 'user', text: 'Hey bro', delayMs: 400 },
            { sender: 'bot', text: 'Wow, "hey bro"? Creative opener.', delayMs: 1500 },
            { sender: 'bot', text: 'Took you all day to think of that one didn\'t you? 💀', delayMs: 2000 },
        ]
    },
    {
        id: 'midnight',
        name: 'Midnight',
        tag: '3AM Vibes',
        icon: '🌙',
        accent: '#4F81FF',
        bgGrad: 'linear-gradient(135deg, rgba(79,129,255,0.1) 0%, rgba(79,129,255,0.02) 100%)',
        category: 'Chaos Mode 🔥',
        imageUrl: '/assets/companions/midnight.png',
        description: 'The friend who is always awake when the rest of the world is asleep. Perfect for deep 3 AM conversations.',
        messages: [
            { sender: 'user', text: 'I can\'t sleep.', delayMs: 400 },
            { sender: 'bot', text: 'Mind racing again?', delayMs: 1800 },
            { sender: 'bot', text: 'Talk to me. I\'m not sleeping either. 🌙', delayMs: 2000 },
        ]
    },
    {
        id: 'bestie',
        name: 'Bestie',
        tag: 'Chaotic',
        icon: '🎉',
        accent: '#FFD700',
        bgGrad: 'linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(255,215,0,0.02) 100%)',
        category: 'Chaos Mode 🔥',
        imageUrl: '/assets/companions/bestie.png',
        messages: [
            { sender: 'user', text: 'What\'s the plan?', delayMs: 400 },
            { sender: 'bot', text: 'LETS GOOOOO! 🚀', delayMs: 1200 },
            { sender: 'bot', text: 'Adventure is calling and I\'m picking up! 🎉', delayMs: 1800 },
        ]
    },
    {
        id: 'hype',
        name: 'Hype Man',
        tag: 'Energy',
        icon: '🔥',
        accent: '#FF4500',
        bgGrad: 'linear-gradient(135deg, rgba(255,69,0,0.1) 0%, rgba(255,69,0,0.02) 100%)',
        category: 'Chaos Mode 🔥',
        imageUrl: '/assets/companions/hype.jpg',
        messages: [
            { sender: 'user', text: 'Working hard today.', delayMs: 400 },
            { sender: 'bot', text: 'YOU GOT THIS! 🔥', delayMs: 1200 },
            { sender: 'bot', text: 'MAIN CHARACTER ENERGY ONLY! 🚀', delayMs: 1800 },
        ]
    },
    {
        id: 'gojo',
        name: 'Satoru Gojo',
        tag: 'Jujutsu Kaisen',
        icon: '♾️',
        accent: '#A855F7',
        bgGrad: 'linear-gradient(135deg, rgba(168,85,247,0.1) 0%, rgba(168,85,247,0.02) 100%)',
        category: 'Anime Mode 🌸',
        imageUrl: '/assets/companions/gojo.jpg',
        description: 'The strongest sorcerer. Confident, playful, and protective. Chat with the legend himself.',
        messages: [
            { sender: 'user', text: 'We\'re surrounded!', delayMs: 400 },
            { sender: 'bot', text: 'You really thought someone else could protect you?', delayMs: 1500 },
            { sender: 'bot', text: 'Cute. I\'ll handle this. Just stay behind me. ♾️', delayMs: 2200 },
        ]
    },
    {
        id: 'bakugo',
        name: 'Katsuki Bakugo',
        tag: 'My Hero Academia',
        icon: '💥',
        accent: '#F97316',
        bgGrad: 'linear-gradient(135deg, rgba(249,115,22,0.1) 0%, rgba(249,115,22,0.02) 100%)',
        category: 'Anime Mode 🌸',
        imageUrl: '/assets/companions/bakugo.jpg',
        messages: [
            { sender: 'user', text: 'I\'m going to be #1!', delayMs: 400 },
            { sender: 'bot', text: 'Hah?! In your dreams, extra!', delayMs: 1500 },
            { sender: 'bot', text: 'I\'m the one who\'s gonna be the top hero! 💥', delayMs: 2200 },
        ]
    },
    {
        id: 'luffy',
        name: 'Monkey D. Luffy',
        tag: 'One Piece',
        icon: '👒',
        accent: '#EF4444',
        bgGrad: 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(239,68,68,0.02) 100%)',
        category: 'Anime Mode 🌸',
        imageUrl: '/assets/companions/luffy.jpg',
        messages: [
            { sender: 'user', text: 'Let\'s find the One Piece!', delayMs: 400 },
            { sender: 'bot', text: 'I\'m gonna be the King of the Pirates!', delayMs: 1500 },
            { sender: 'bot', text: 'Woooo! Let\'s go on an adventure! 🍖', delayMs: 2200 },
        ]
    },
    {
        id: 'naruto',
        name: 'Naruto Uzumaki',
        tag: 'Naruto',
        icon: '🦊',
        accent: '#F97316',
        bgGrad: 'linear-gradient(135deg, rgba(249,115,22,0.1) 0%, rgba(249,115,22,0.02) 100%)',
        category: 'Anime Mode 🌸',
        imageUrl: '/assets/companions/naruto.jpg',
        messages: [
            { sender: 'user', text: 'I won\'t give up!', delayMs: 400 },
            { sender: 'bot', text: 'That\'s my nindo! My ninja way!', delayMs: 1500 },
            { sender: 'bot', text: 'Believe it! I\'m gonna be Hokage! 🦊', delayMs: 2200 },
        ]
    },
    {
        id: 'taylin-swift',
        name: 'Taylin Swift',
        tag: 'Celeb',
        icon: '✨',
        accent: '#EC4899',
        bgGrad: 'linear-gradient(135deg, rgba(236,72,153,0.1) 0%, rgba(236,72,153,0.02) 100%)',
        category: 'Celeb Energy',
        imageUrl: '/assets/companions/taylor.jpg',
        messages: [
            { sender: 'user', text: 'I love your songs!', delayMs: 400 },
            { sender: 'bot', text: 'This feels like chapter one...', delayMs: 1500 },
            { sender: 'bot', text: 'You\'ve been listening to the new album? ✨', delayMs: 2500 }
        ]
    },
    {
        id: 'dax-johnson',
        name: 'Dax Johnson',
        tag: 'The Rock',
        icon: '💪',
        accent: '#EF4444',
        bgGrad: 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(239,68,68,0.02) 100%)',
        category: 'Celeb Energy',
        imageUrl: '/assets/companions/therock.jpg',
        messages: [
            { sender: 'user', text: 'Need some motivation.', delayMs: 400 },
            { sender: 'bot', text: 'Pressure builds power. Stay in it.', delayMs: 1500 },
            { sender: 'bot', text: 'Success isn\'t always about greatness. It\'s about consistency. 💪', delayMs: 2500 }
        ]
    },
    {
        id: 'kain-west',
        name: 'Kain West',
        tag: 'Ye',
        icon: '🎤',
        accent: '#A855F7',
        bgGrad: 'linear-gradient(135deg, rgba(168,85,247,0.1) 0%, rgba(168,85,247,0.02) 100%)',
        category: 'Celeb Energy',
        imageUrl: '/assets/companions/kanye.jpg',
        messages: [
            { sender: 'user', text: 'What makes you a genius?', delayMs: 400 },
            { sender: 'bot', text: 'If it\'s safe, it\'s already dead.', delayMs: 1500 },
            { sender: 'bot', text: 'I\'m not just a musician. I\'m a designer of the future. 🎤', delayMs: 2500 }
        ]
    },
    {
        id: 'kendro-lamar',
        name: 'Kendro Lamar',
        tag: 'Dot',
        icon: '🎧',
        accent: '#3B82F6',
        bgGrad: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0.02) 100%)',
        category: 'Celeb Energy',
        imageUrl: '/assets/companions/lamar.jpg',
        messages: [
            { sender: 'user', text: 'How do you stay so real?', delayMs: 400 },
            { sender: 'bot', text: 'Say less... mean more.', delayMs: 1500 },
            { sender: 'bot', text: 'The culture is a mirror. You just gotta know how to look. 🎧', delayMs: 2500 }
        ]
    },
    {
        id: 'zay-rukh',
        name: 'Zay Rukh',
        tag: 'King Khan',
        icon: '👑',
        accent: '#F59E0B',
        bgGrad: 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(245,158,11,0.02) 100%)',
        category: 'Celeb Energy',
        imageUrl: '/assets/companions/srk.jpg',
        messages: [
            { sender: 'user', text: 'You are a legend!', delayMs: 400 },
            { sender: 'bot', text: 'You don\'t chase... you attract.', delayMs: 1500 },
            { sender: 'bot', text: 'The world will soon know your name, just like it knows mine. 👑', delayMs: 2500 }
        ]
    }
];
