import OpenAI from 'openai';
import { DAY_RULES, GLOBAL_RULES, DayDetails } from './prompts';

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy-key',
    baseURL: process.env.OPENAI_BASE_URL,
});

interface Settings {
    productService: string;
    targetCustomer: string;
    coreProblem: string;
    uniqueAngle: string;
}

export async function generatePost(
    settings: Settings,
    dayName: string
): Promise<string> {
    const dayRule = DAY_RULES[dayName] || DAY_RULES['Monday'];

    const prompt = `
You are an expert LinkedIn ghostwriter. Write a post for the following business:

Product/Service: ${settings.productService}
Target Customer: ${settings.targetCustomer}
Core Problem: ${settings.coreProblem}
Unique Angle: ${settings.uniqueAngle}

Current Day: ${dayName}
Theme: ${dayRule.theme}
Day Rules: ${dayRule.rules}

GLOBAL RULES (MUST FOLLOW):
${GLOBAL_RULES}

Output ONLY the post content. Do not include introductory text, headers, or explanations.
`;

    try {
        const completion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-4o',
            messages: [
                { role: 'system', content: 'You are a professional LinkedIn copywriter.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 1000,
        });

        return completion.choices[0].message.content?.trim() || '';
    } catch (error) {
        console.error('Error generating post:', error);
        try {
            const fs = await import('fs');
            fs.appendFileSync('error.txt', 'GENERATOR_ERROR: ' + JSON.stringify(error, Object.getOwnPropertyNames(error)) + '\n');
        } catch (fsError) {
            console.error('Failed to log error to file:', fsError);
        }
        throw new Error('Failed to generate post');
    }
}
