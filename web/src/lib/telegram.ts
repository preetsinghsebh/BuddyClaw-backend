export const getTelegramLink = (pId: string, action: 'persona' | 'interpret' | 'default' = 'persona') => {
    const personaId = pId.toLowerCase();
    const startPrefix = action === 'interpret' ? 'interpret_' : 'persona_';

    // 1. DEDICATED INDIVIDUAL BOTS
    if (personaId === 'ziva') {
        return `https://t.me/Ziva_Companion_bot?start=${startPrefix}${personaId}`;
    }
    if (personaId === 'liam') {
        return `https://t.me/Liam_Companion_Bot?start=${startPrefix}${personaId}`;
    }
    if (personaId === 'emma') {
        return `https://t.me/Emma_Companion_Bot?start=${startPrefix}${personaId}`;
    }
    if (personaId === 'confident-zane') {
        return `https://t.me/Zane_Companion_Bot?start=${startPrefix}${personaId}`;
    }

    // 2. CATEGORY-BASED BOTS
    const animeIds = ['gojo', 'bakugo', 'luffy', 'naruto'];
    if (animeIds.includes(personaId)) {
        return `https://t.me/Anime_Companion_Bot?start=${startPrefix}${personaId}`;
    }

    const celebIds = ['taylin-swift', 'dax-johnson', 'kain-west', 'kendro-lamar', 'zay-rukh'];
    if (celebIds.includes(personaId)) {
        return `https://t.me/Celeb_Energy_Bot?start=${startPrefix}${personaId}`;
    }

    const chaosIds = ['roaster', 'midnight', 'bestie', 'hype'];
    if (chaosIds.includes(personaId)) {
        return `https://t.me/Chaos_Companion_Bot?start=${startPrefix}${personaId}`;
    }

    const safeSpaceIds = ['bua', 'chill_chacha', 'warm-grandma', 'big_sister'];
    if (safeSpaceIds.includes(personaId)) {
        return `https://t.me/SafeSpace_Companion_Bot?start=${startPrefix}${personaId}`;
    }

    const mindResetIds = ['caring-listener', 'calm-guide', 'sleep-luna', 'mindful-maya'];
    if (mindResetIds.includes(personaId)) {
        return `https://t.me/MindReset_Companion_Bot?start=${startPrefix}${personaId}`;
    }

    // 3. GLOBAL FALLBACK (Safety Catch-all: Points to Anime Hub)
    return `https://t.me/Anime_Companion_Bot?start=${startPrefix}${personaId}`;
};
