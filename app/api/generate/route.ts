import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generatePost } from '@/lib/ai/generator';
import { validatePost } from '@/lib/ai/validator';

export async function POST(req: Request) {
    try {
        const { manualDay } = await req.json().catch(() => ({}));

        // 1. Get Settings
        const settings = await db.settings.findFirst();
        if (!settings) {
            return NextResponse.json({ error: 'Settings not configured' }, { status: 400 });
        }

        // 2. Determine Day
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const now = new Date();
        const dayName = manualDay || days[now.getDay()];

        // 3. Generation Loop with Retry
        let finalContent = '';
        let validationResult = { isValid: false, reason: '' };
        const MAX_RETRIES = 3;

        for (let i = 0; i < MAX_RETRIES; i++) {
            const content = await generatePost(settings, dayName);
            const check = await validatePost(content, dayName);

            finalContent = content;
            validationResult = check as any; // ts fix

            if (check.isValid) {
                break;
            }
        }

        // 4. Save to DB
        const post = await db.post.create({
            data: {
                content: finalContent,
                dayOfWeek: dayName,
                isValid: validationResult.isValid,
                validationReason: validationResult.reason || (validationResult.isValid ? 'Passed' : 'Failed after retries'),
                scheduledDate: now,
            },
        });

        return NextResponse.json(post);

    } catch (error) {
        console.error(error);
        const fs = require('fs');
        fs.appendFileSync('error.txt', JSON.stringify(error, Object.getOwnPropertyNames(error)) + '\n');
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
