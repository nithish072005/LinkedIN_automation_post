import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isTokenExpired } from '@/lib/linkedin/oauth';

/**
 * Get LinkedIn connection status
 * GET /api/linkedin/connect
 */
export async function GET() {
    try {
        const settings = await db.settings.findFirst();

        if (!settings || !settings.linkedinAccessToken) {
            return NextResponse.json({
                connected: false,
            });
        }

        // Check if token is expired
        const expired = settings.linkedinTokenExpiry
            ? isTokenExpired(settings.linkedinTokenExpiry)
            : true;

        return NextResponse.json({
            connected: !expired,
            connectedAt: settings.linkedinConnectedAt,
            tokenExpired: expired,
        });
    } catch (error) {
        console.error('Error checking LinkedIn connection:', error);
        return NextResponse.json(
            { error: 'Failed to check connection status' },
            { status: 500 }
        );
    }
}

/**
 * Disconnect LinkedIn account
 * DELETE /api/linkedin/connect
 */
export async function DELETE() {
    try {
        const settings = await db.settings.findFirst();

        if (!settings) {
            return NextResponse.json(
                { error: 'Settings not found' },
                { status: 404 }
            );
        }

        // Clear LinkedIn connection data
        await db.settings.update({
            where: { id: settings.id },
            data: {
                linkedinAccessToken: null,
                linkedinTokenExpiry: null,
                linkedinUserId: null,
                linkedinConnectedAt: null,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error disconnecting LinkedIn:', error);
        return NextResponse.json(
            { error: 'Failed to disconnect LinkedIn' },
            { status: 500 }
        );
    }
}
