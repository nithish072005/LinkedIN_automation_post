import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { decryptToken, isTokenExpired } from '@/lib/linkedin/oauth';
import { publishToLinkedIn } from '@/lib/linkedin/api';

/**
 * Publish a post to LinkedIn
 * POST /api/linkedin/publish
 * Body: { postId: number }
 */
export async function POST(request: NextRequest) {
    try {
        const { postId } = await request.json();

        if (!postId) {
            return NextResponse.json(
                { error: 'Post ID is required' },
                { status: 400 }
            );
        }

        // Get the post
        const post = await db.post.findUnique({
            where: { id: postId },
        });

        if (!post) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            );
        }

        // Pre-publish validation guards
        if (!post.isValid) {
            return NextResponse.json(
                { error: 'Post is not valid and cannot be published' },
                { status: 400 }
            );
        }

        if (post.published) {
            return NextResponse.json(
                { error: 'Post has already been published' },
                { status: 400 }
            );
        }

        // Get LinkedIn connection settings
        const settings = await db.settings.findFirst();

        if (!settings || !settings.linkedinAccessToken || !settings.linkedinUserId) {
            return NextResponse.json(
                { error: 'LinkedIn account not connected' },
                { status: 400 }
            );
        }

        // Check if token is expired
        if (settings.linkedinTokenExpiry && isTokenExpired(settings.linkedinTokenExpiry)) {
            return NextResponse.json(
                { error: 'LinkedIn token expired. Please reconnect your account.' },
                { status: 401 }
            );
        }

        // Decrypt the access token
        const accessToken = decryptToken(settings.linkedinAccessToken);

        // Publish to LinkedIn
        try {
            const { postId: linkedinPostId } = await publishToLinkedIn(
                accessToken,
                settings.linkedinUserId,
                post.content
            );

            // Update post status
            await db.post.update({
                where: { id: postId },
                data: {
                    published: true,
                    publishedAt: new Date(),
                    linkedinPostId: linkedinPostId,
                    publishError: null,
                },
            });

            return NextResponse.json({
                success: true,
                linkedinPostId,
            });
        } catch (publishError: any) {
            // Log the error in the database
            await db.post.update({
                where: { id: postId },
                data: {
                    publishError: publishError.message || 'Unknown error',
                },
            });

            // Handle specific errors
            if (publishError.message === 'TOKEN_EXPIRED') {
                return NextResponse.json(
                    { error: 'LinkedIn token expired. Please reconnect your account.' },
                    { status: 401 }
                );
            }

            if (publishError.message === 'RATE_LIMITED') {
                return NextResponse.json(
                    { error: 'LinkedIn rate limit exceeded. Please try again later.' },
                    { status: 429 }
                );
            }

            throw publishError;
        }
    } catch (error) {
        console.error('Error publishing to LinkedIn:', error);
        return NextResponse.json(
            { error: 'Failed to publish to LinkedIn' },
            { status: 500 }
        );
    }
}
