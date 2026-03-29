import fetch from 'node-fetch';

/**
 * Sarvam API Integration for Buddy Claw
 */
export async function getSarvamChatResponse(messages, persona) {
    const PROXY_URL = process.env.SARVAM_PROXY_URL || 'https://api.sarvam.ai/v1/chat/completions';
    const SARVAM_API_KEY = process.env.SARVAM_API_KEY;

    if (!SARVAM_API_KEY) {
        throw new Error('SARVAM_API_KEY is missing from environment variables.');
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SARVAM_API_KEY}`
    };

    const payload = {
        model: 'sarvam-105b',
        messages: messages,
        temperature: persona.temperature ?? 0.7,
        stream: false
    };

    const response = await fetch(PROXY_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        timeout: 25000 
    });

    if (!response.ok) {
        const body = await response.text().catch(() => '');
        throw new Error(`Sarvam request failed: ${response.status} ${body}`);
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || data.output || '';
    
    // Clean up <think> tags if they exist
    content = content.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/<\/?think>/gi, '').trim();

    if (!content) {
        throw new Error('LLM returned empty response');
    }

    return content;
}
