import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    const settings = await db.settings.findFirst();
    return NextResponse.json(settings || {});
}

export async function POST(req: Request) {
    const body = await req.json();
    const { productService, targetCustomer, coreProblem, uniqueAngle } = body;

    const count = await db.settings.count();

    let settings;
    if (count === 0) {
        settings = await db.settings.create({
            data: { productService, targetCustomer, coreProblem, uniqueAngle },
        });
    } else {
        // Update the first record found
        const first = await db.settings.findFirst();
        if (first) {
            settings = await db.settings.update({
                where: { id: first.id },
                data: { productService, targetCustomer, coreProblem, uniqueAngle },
            });
        }
    }

    return NextResponse.json(settings);
}
