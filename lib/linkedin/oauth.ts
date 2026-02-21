import crypto from 'crypto';

const LINKEDIN_AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization';
const LINKEDIN_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';

/**
 * Generate a random state parameter for CSRF protection
 */
export function generateState(): string {
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate LinkedIn OAuth authorization URL
 */
export function getAuthorizationUrl(state: string): string {
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const redirectUri = process.env.LINKEDIN_REDIRECT_URI;

    if (!clientId || !redirectUri) {
        throw new Error('LinkedIn OAuth credentials not configured');
    }

    const params = new URLSearchParams({
        response_type: 'code',
        client_id: clientId,
        redirect_uri: redirectUri,
        state: state,
        scope: 'openid profile email w_member_social', // Permissions needed for posting
    });

    return `${LINKEDIN_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(code: string): Promise<{
    accessToken: string;
    expiresIn: number;
}> {
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    const redirectUri = process.env.LINKEDIN_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
        throw new Error('LinkedIn OAuth credentials not configured');
    }

    const params = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
    });

    const response = await fetch(LINKEDIN_TOKEN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to exchange code for token: ${error}`);
    }

    const data = await response.json();

    return {
        accessToken: data.access_token,
        expiresIn: data.expires_in, // Usually 60 days for LinkedIn
    };
}

/**
 * Encrypt access token for secure storage
 */
export function encryptToken(token: string): string {
    const secret = process.env.ENCRYPTION_SECRET;

    if (!secret || secret.length !== 64) {
        throw new Error('ENCRYPTION_SECRET must be a 64-character hex string (32 bytes)');
    }

    const key = Buffer.from(secret, 'hex');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Return IV + encrypted data
    return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypt access token from storage
 */
export function decryptToken(encryptedToken: string): string {
    const secret = process.env.ENCRYPTION_SECRET;

    if (!secret || secret.length !== 64) {
        throw new Error('ENCRYPTION_SECRET must be a 64-character hex string (32 bytes)');
    }

    const key = Buffer.from(secret, 'hex');
    const parts = encryptedToken.split(':');

    if (parts.length !== 2) {
        throw new Error('Invalid encrypted token format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];

    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}

/**
 * Check if token is expired
 */
export function isTokenExpired(expiryDate: Date): boolean {
    return new Date() >= expiryDate;
}
