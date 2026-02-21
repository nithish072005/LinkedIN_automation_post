import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { exchangeCodeForToken, encryptToken } from '@/lib/linkedin/oauth';
import { getLinkedInProfile } from '@/lib/linkedin/api';
import { db } from '@/lib/db';

/**
 * LinkedIn OAuth callback handler
 * GET /api/auth/linkedin/callback?code=...&state=...
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        // Check for OAuth errors
        if (error) {
            return NextResponse.redirect(
                new URL(`/?error=linkedin_auth_denied`, request.url)
            );
        }

        // Validate required parameters
        if (!code || !state) {
            return NextResponse.redirect(
                new URL(`/?error=invalid_oauth_response`, request.url)
            );
        }

        // Validate CSRF state
        const cookieStore = await cookies();
        const storedState = cookieStore.get('linkedin_oauth_state')?.value;

        if (!storedState || storedState !== state) {
            return NextResponse.redirect(
                new URL(`/?error=invalid_state`, request.url)
            );
        }

        // Clear the state cookie
        cookieStore.delete('linkedin_oauth_state');

        console.log('🔄 [OAuth] Starting token exchange...');

        // Exchange code for access token
        let accessToken, expiresIn;
        try {
            const tokenData = await exchangeCodeForToken(code);
            accessToken = tokenData.accessToken;
            expiresIn = tokenData.expiresIn;
            console.log('✅ [OAuth] Token exchange successful');
        } catch (tokenError: any) {
            console.error('❌ [OAuth] Token exchange failed:', tokenError.message);
            console.error('   Full error:', tokenError);
            throw new Error(`TOKEN_EXCHANGE_FAILED: ${tokenError.message}`);
        }

        console.log('🔄 [OAuth] Fetching LinkedIn profile...');

        // Get LinkedIn user profile
        let profile;
        try {
            profile = await getLinkedInProfile(accessToken);
            console.log('✅ [OAuth] Profile fetched:', profile.id);
        } catch (profileError: any) {
            console.error('❌ [OAuth] Profile fetch failed:', profileError.message);
            throw new Error(`PROFILE_FETCH_FAILED: ${profileError.message}`);
        }

        console.log('🔄 [OAuth] Encrypting token...');

        // Encrypt the access token
        let encryptedToken;
        try {
            encryptedToken = encryptToken(accessToken);
            console.log('✅ [OAuth] Token encrypted');
        } catch (encryptError: any) {
            console.error('❌ [OAuth] Token encryption failed:', encryptError.message);
            throw new Error(`ENCRYPTION_FAILED: ${encryptError.message}`);
        }

        // Calculate token expiry date
        const expiryDate = new Date();
        expiryDate.setSeconds(expiryDate.getSeconds() + expiresIn);

        console.log('🔄 [OAuth] Saving to database...');

        // Update settings with LinkedIn connection info
        const settings = await db.settings.findFirst();

        if (!settings) {
            console.error('❌ [OAuth] No settings record found');
            return NextResponse.redirect(
                new URL(`/?error=settings_not_found`, request.url)
            );
        }

        try {
            await db.settings.update({
                where: { id: settings.id },
                data: {
                    linkedinAccessToken: encryptedToken,
                    linkedinTokenExpiry: expiryDate,
                    linkedinUserId: profile.id,
                    linkedinConnectedAt: new Date(),
                },
            });
            console.log('✅ [OAuth] Database updated successfully');
        } catch (dbError: any) {
            console.error('❌ [OAuth] Database update failed:', dbError.message);
            throw new Error(`DB_UPDATE_FAILED: ${dbError.message}`);
        }

        console.log('✅ [OAuth] LinkedIn connection complete!');

        // Redirect back to settings page with success
        return NextResponse.redirect(
            new URL(`/?linkedin_connected=true`, request.url)
        );
    } catch (error: any) {
        console.error('❌ [OAuth] Callback error:', error.message);
        console.error('   Error type:', error.constructor.name);
        console.error('   Stack:', error.stack);

        // Include error details in redirect for debugging
        const errorMsg = encodeURIComponent(error.message || 'Unknown error');
        return NextResponse.redirect(
            new URL(`/?error=linkedin_connection_failed&details=${errorMsg}`, request.url)
        );
    }
}
