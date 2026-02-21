/**
 * LinkedIn API client for posting content
 */

const LINKEDIN_API_BASE = 'https://api.linkedin.com/v2';

/**
 * Get LinkedIn user profile information
 */
export async function getLinkedInProfile(accessToken: string): Promise<{
    id: string;
    firstName: string;
    lastName: string;
}> {
    const response = await fetch(`${LINKEDIN_API_BASE}/userinfo`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to fetch LinkedIn profile: ${error}`);
    }

    const data = await response.json();

    return {
        id: data.sub, // LinkedIn user ID (URN)
        firstName: data.given_name,
        lastName: data.family_name,
    };
}

/**
 * Publish a post to LinkedIn
 */
export async function publishToLinkedIn(
    accessToken: string,
    userId: string,
    content: string
): Promise<{ postId: string }> {
    // LinkedIn UGC Posts API v2
    const payload = {
        author: `urn:li:person:${userId}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
            'com.linkedin.ugc.ShareContent': {
                shareCommentary: {
                    text: content,
                },
                shareMediaCategory: 'NONE',
            },
        },
        visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
    };

    const response = await fetch(`${LINKEDIN_API_BASE}/ugcPosts`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const error = await response.text();

        // Check for token expiry
        if (response.status === 401) {
            throw new Error('TOKEN_EXPIRED');
        }

        // Check for rate limiting
        if (response.status === 429) {
            throw new Error('RATE_LIMITED');
        }

        throw new Error(`Failed to publish to LinkedIn: ${error}`);
    }

    const data = await response.json();

    // Extract post ID from response
    const postId = data.id || 'unknown';

    return { postId };
}

/**
 * Validate that the access token is still valid
 */
export async function validateToken(accessToken: string): Promise<boolean> {
    try {
        await getLinkedInProfile(accessToken);
        return true;
    } catch (error) {
        return false;
    }
}
