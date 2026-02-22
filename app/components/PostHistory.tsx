'use client';

import { useState, useEffect } from 'react';
import StatusBadge from './StatusBadge';
import EmptyState from './EmptyState';
import { SkeletonCards } from './LoadingSpinner';

type Post = {
    id: number;
    content: string;
    dayOfWeek: string;
    scheduledDate: string;
    isValid: boolean;
    validationReason: string;
    isPosted: boolean;
    published: boolean;
    publishedAt?: string;
    linkedinPostId?: string;
    publishError?: string;
};

export default function PostHistory() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [publishing, setPublishing] = useState<number | null>(null);

    const fetchPosts = () => {
        setLoading(true);
        fetch('/api/posts')
            .then((res) => res.json())
            .then((data) => {
                setPosts(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleManualGenerate = async () => {
        setGenerating(true);
        await fetch('/api/generate', {
            method: 'POST',
            body: JSON.stringify({ manualDay: null }),
        });
        setGenerating(false);
        fetchPosts();
    };

    const handlePublishPost = async (postId: number) => {
        if (!confirm('Are you sure you want to publish this post to LinkedIn?')) {
            return;
        }

        setPublishing(postId);
        try {
            const response = await fetch('/api/linkedin/publish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postId }),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(`Failed to publish: ${data.error}`);
            } else {
                alert('Post published successfully!');
                fetchPosts();
            }
        } catch {
            alert('Failed to publish post');
        } finally {
            setPublishing(null);
        }
    };

    const getPostStatus = (post: Post): { label: string; variant: 'published' | 'validated' | 'draft' | 'error' } => {
        if (post.published) return { label: 'Published', variant: 'published' };
        if (post.publishError) return { label: 'Failed', variant: 'error' };
        if (post.isValid) return { label: 'Validated', variant: 'validated' };
        return { label: 'Draft', variant: 'draft' };
    };

    // Compute stats
    const totalPosts = posts.length;
    const publishedCount = posts.filter(p => p.published).length;
    const validatedCount = posts.filter(p => p.isValid && !p.published).length;
    const draftCount = posts.filter(p => !p.isValid).length;

    return (
        <div>
            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card-icon blue">
                        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                        </svg>
                    </div>
                    <div className="stat-card-label">Total Posts</div>
                    <div className="stat-card-value">{totalPosts}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon green">
                        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                    </div>
                    <div className="stat-card-label">Published</div>
                    <div className="stat-card-value">{publishedCount}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon blue">
                        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75" />
                        </svg>
                    </div>
                    <div className="stat-card-label">Validated</div>
                    <div className="stat-card-value">{validatedCount}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon gray">
                        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                    </div>
                    <div className="stat-card-label">Drafts</div>
                    <div className="stat-card-value">{draftCount}</div>
                </div>
            </div>

            {/* Section Header */}
            <div className="section-header">
                <div>
                    <h2 className="section-title">Recent Posts</h2>
                    <p className="section-subtitle">Your latest generated content</p>
                </div>
                <button
                    onClick={handleManualGenerate}
                    className="btn btn-primary"
                    disabled={generating}
                >
                    {generating ? (
                        <>
                            <span className="spinner spinner-sm" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="16" height="16">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                            </svg>
                            Generate Today's Post
                        </>
                    )}
                </button>
            </div>

            {/* Loading State */}
            {loading && <SkeletonCards count={3} />}

            {/* Empty State */}
            {!loading && posts.length === 0 && (
                <EmptyState
                    title="No posts generated yet"
                    description="Generate your first AI-powered LinkedIn post to get started with your content pipeline."
                    actionLabel="Generate First Post"
                    onAction={handleManualGenerate}
                />
            )}

            {/* Posts List */}
            {!loading && posts.length > 0 && (
                <div className="posts-grid">
                    {posts.map((post) => {
                        const status = getPostStatus(post);
                        return (
                            <div key={post.id} className={`post-card status-${status.variant}`}>
                                <div className="post-card-header">
                                    <span className="post-card-day">{post.dayOfWeek}</span>
                                    <span className="post-card-date">
                                        {new Date(post.scheduledDate).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                    </span>
                                </div>

                                <div className="post-card-content">
                                    {post.content}
                                </div>

                                <div className="post-card-meta">
                                    <div className="post-card-status-row">
                                        <StatusBadge status={status.variant} label={status.label} />

                                        {!post.isValid && (
                                            <span className="post-card-info error">
                                                {post.validationReason}
                                            </span>
                                        )}
                                    </div>

                                    {post.published && post.publishedAt && (
                                        <span className="post-card-info success">
                                            Published {new Date(post.publishedAt).toLocaleString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: 'numeric',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                    )}

                                    {post.publishError && (
                                        <span className="post-card-info error">
                                            {post.publishError}
                                        </span>
                                    )}
                                </div>

                                {/* Publish action */}
                                {post.isValid && !post.published && (
                                    <div className="post-card-actions">
                                        <button
                                            className="btn btn-primary btn-full"
                                            onClick={() => handlePublishPost(post.id)}
                                            disabled={publishing === post.id}
                                        >
                                            {publishing === post.id ? (
                                                <>
                                                    <span className="spinner spinner-sm" />
                                                    Publishing...
                                                </>
                                            ) : (
                                                <>
                                                    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="16" height="16">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                                                    </svg>
                                                    Publish to LinkedIn
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
