export const getTelegramLink = (pId: string, action: 'persona' | 'interpret' | 'default' = 'persona') => {
    const personaId = pId.toLowerCase();
    // 1. DEDICATED INDIVIDUAL BOTS
    if (personaId === 'sweetie' || personaId === 'sweet_gf') {
        return "https://t.me/Ziva_Companion_bot";
    }
    
    if (personaId === 'partner' || personaId === 'protective_bf') {
        if (action === 'interpret') return `https://t.me/Liam_Companion_Bot?start=interpret_${personaId}`; 
        return "https://t.me/Liam_Companion_Bot";
    }

    if (personaId === 'flirty-stranger' || personaId === 'emma') {
        if (action === 'interpret') return `https://t.me/Emma_Companion_Bot?start=interpret_${personaId}`;
        return "https://t.me/Emma_Companion_Bot";
    }

    if (personaId === 'confident-zane' || personaId === 'zane') {
        if (action === 'interpret') return `https://t.me/Zane_Companion_Bot?start=interpret_${personaId}`;
        return "https://t.me/Zane_Companion_Bot";
    }

    // 2. CATEGORY-BASED BOTS
    const animeIds = ['gojo', 'bakugo', 'luffy', 'naruto', 'levi', 'anime_gojo', 'anime_bakugo', 'anime_luffy', 'anime_levi'];
    if (animeIds.includes(personaId)) {
        if (action === 'interpret') return `https://t.me/Anime_Companion_Bot?start=interpret_${personaId}`;
        return `https://t.me/Anime_Companion_Bot?start=persona_${personaId}`;
    }

    const celebIds = ['taylin-swift', 'dax-johnson', 'kain-west', 'kendro-lamar', 'zay-rukh'];
    if (celebIds.includes(personaId)) {
        if (action === 'interpret') return `https://t.me/Celeb_Energy_Bot?start=interpret_${personaId}`;
        return `https://t.me/Celeb_Energy_Bot?start=persona_${personaId}`;
    }

    const chaosIds = ['roaster', 'midnight', 'bestie', 'hype', 'meme_lord', 'party_bestie', 'hype_man'];
    if (chaosIds.includes(personaId)) {
        if (action === 'interpret') return `https://t.me/Chaos_Companion_Bot?start=interpret_${personaId}`;
        return `https://t.me/Chaos_Companion_Bot?start=persona_${personaId}`;
    }

    const safeSpaceIds = ['bua', 'chill_chacha', 'warm-grandma', 'big_sister', 'jealous_bua', 'chill_chacha', 'warm_grandma', 'big_brother', 'fun_aunt'];
    if (safeSpaceIds.includes(personaId)) {
        if (action === 'interpret') return `https://t.me/SafeSpace_Companion_Bot?start=interpret_${personaId}`;
        return `https://t.me/SafeSpace_Companion_Bot?start=persona_${personaId}`;
    }

    const mindResetIds = ['caring-listener', 'calm-guide', 'sleep-luna', 'mindful-maya', 'listener', 'guide'];
    if (mindResetIds.includes(personaId)) {
        if (action === 'interpret') return `https://t.me/MindReset_Companion_Bot?start=interpret_${personaId}`;
        return `https://t.me/MindReset_Companion_Bot?start=persona_${personaId}`;
    }

    // 3. DEFAULT FALLBACK
    if (action === 'interpret') return `https://t.me/Real_Companion_Bot?start=interpret_${personaId}`;
    if (action === 'default') return "https://t.me/Real_Companion_Bot";

    return `https://t.me/Real_Companion_Bot?start=persona_${personaId}`;
};
