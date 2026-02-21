export type DayDetails = {
    theme: string;
    rules: string;
};

export const DAY_RULES: Record<string, DayDetails> = {
    Monday: {
        theme: 'Authority Builder',
        rules: 'Teach ONE clear concept or framework. No storytelling, no questions, no lists. Structure: Hook -> Concept -> Application / Insight.',
    },
    Tuesday: {
        theme: 'Momentum Builder',
        rules: 'Expand on an idea with practical execution. No questions. Action-oriented tone.',
    },
    Wednesday: {
        theme: 'Engagement Driver',
        rules: 'Present a strong opinion or challenge a common assumption. End with EXACTLY ONE question to provoke thought.',
    },
    Thursday: {
        theme: 'Mistake / Lesson',
        rules: 'Describe ONE mistake or wrong assumption and the lesson learned. Vulnerable but confident. No questions.',
    },
    Friday: {
        theme: 'Value Drop',
        rules: 'Provide 3-5 actionable tips using numbered steps only. No questions. Pure value.',
    },
    Saturday: {
        theme: 'Behind the Scenes',
        rules: 'Share a behind-the-scenes insight, process, or system that improves operations. Talk about internal workflows, automation, or efficiency. No storytelling about personal life. Keep it practical and reflective. Do NOT end with a question.',
    },
    Sunday: {
        theme: 'Strategic Reflection',
        rules: 'Share a strategic reflection, mindset shift, or long-term lesson. Focus on decision-making, systems thinking, or growth perspective. Slightly thoughtful tone. End with EXACTLY ONE question that encourages reflection.',
    },
};

export const GLOBAL_RULES = `
- Platform: LinkedIn
- Language: Professional Business English
- Audience: Founders, Startup Owners, B2B Decision Makers
- Length: 120–180 words
- No emojis
- No hashtags
- No markdown formatting (plain text only)
- Short paragraphs (maximum 2 lines each)
- Clear, confident, non-salesy tone
`;
