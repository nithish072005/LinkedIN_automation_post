import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    const posts = await db.post.findMany({
        orderBy: { scheduledDate: 'desc' },
        take: 30,
    });
    return NextResponse.json(posts);
}

