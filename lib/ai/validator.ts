import OpenAI from 'openai';
import { GLOBAL_RULES, DAY_RULES } from './prompts';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy-key',
    baseURL: process.env.OPENAI_BASE_URL,
});

export async function validatePost(content: string, dayName: string): Promise<{ isValid: boolean; reason?: string }> {
    const dayRule = DAY_RULES[dayName] || DAY_RULES['Monday'];

    const prompt = `
You are a strict content editor. Review the following LinkedIn post to ensure it meets these criteria:

1. Meets length constraints (approx 120-180 words, short paragraphs).
2. NO emojis.
3. NO hashtags.
4. NO markdown formatting.
5. Professional tone.
6. Adheres to the specific rule for ${dayName} — Theme: "${dayRule.theme}", Rule: "${dayRule.rules}".

GLOBAL RULES:
${GLOBAL_RULES}

POST CONTENT:
"${content}"

If the post matches ALL criteria, reply with "VALID".
If it fails, reply with "INVALID: <reason>".
`;

    try {
        const completion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-4o',
            messages: [{ role: 'system', content: 'You are a strict content validator.' }, { role: 'user', content: prompt }],
            temperature: 0,
            max_tokens: 1000,
        });

        const response = completion.choices[0].message.content?.trim() || '';

        if (response.startsWith('VALID')) {
            return { isValid: true };
        } else {
            return { isValid: false, reason: response.replace('INVALID:', '').trim() };
        }
    } catch (error) {
        console.error('Validation error:', error);
        // Fail safe: accept if validation errors out to avoid blocking? Or reject?
        // Let's reject to be safe.
        return { isValid: false, reason: 'Validation service error' };
    }
}
