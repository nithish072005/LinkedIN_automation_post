import { NextResponse } from 'next/server';
import { generateState, getAuthorizationUrl } from '@/lib/linkedin/oauth';
import { cookies } from 'next/headers';

/**
 * Initiate LinkedIn OAuth flow
 * GET /api/auth/linkedin
 */
export async function GET() {
    try {
        // Generate CSRF state token
        const state = generateState();

        // Store state in cookie for validation in callback
        const cookieStore = await cookies();
        cookieStore.set('linkedin_oauth_state', state, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 600, // 10 minutes
        });

        // Generate authorization URL
        const authUrl = getAuthorizationUrl(state);

        // Redirect to LinkedIn
        return NextResponse.redirect(authUrl);
    } catch (error) {
        console.error('OAuth initiation error:', error);
        return NextResponse.json(
            { error: 'Failed to initiate LinkedIn authentication' },
            { status: 500 }
        );
    }
}
