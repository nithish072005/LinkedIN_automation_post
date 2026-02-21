'use client';

import { useState, useEffect } from 'react';

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
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [publishing, setPublishing] = useState<number | null>(null);

    const fetchPosts = () => {
        setLoading(true);
        fetch('/api/posts')
            .then((res) => res.json())
            .then((data) => {
                setPosts(data);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleManualGenerate = async () => {
        setGenerating(true);
        // Explicitly asking for today; or could pass a specific day for testing
        await fetch('/api/generate', {
            method: 'POST',
            body: JSON.stringify({ manualDay: null }), // null means auto-detect today
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
        } catch (error) {
            alert('Failed to publish post');
        } finally {
            setPublishing(null);
        }
    };

    const getPostStatus = (post: Post) => {
        if (post.published) return { label: 'Published', color: 'green' };
        if (post.publishError) return { label: 'Publish Failed', color: 'red' };
        if (post.isValid) return { label: 'Validated', color: 'blue' };
        return { label: 'Draft', color: 'gray' };
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem' }}>Recent Posts</h2>
                <button onClick={handleManualGenerate} className="btn" disabled={generating}>
                    {generating ? 'Generating...' : 'Generate Today\'s Post'}
                </button>
            </div>

            <div className="grid">
                {posts.length === 0 && !loading && <p>No posts generated yet.</p>}
                {posts.map((post) => {
                    const status = getPostStatus(post);
                    return (
                        <div key={post.id} className="card" style={{ borderColor: status.color }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: 'bold' }}>{post.dayOfWeek}</span>
                                <span style={{ fontSize: '0.875rem', color: '#666' }}>
                                    {new Date(post.scheduledDate).toLocaleDateString()}
                                </span>
                            </div>

                            <div style={{ whiteSpace: 'pre-wrap', marginBottom: '1rem', padding: '1rem', background: 'var(--background)', borderRadius: '0.25rem' }}>
                                {post.content}
                            </div>

                            <div style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                                <strong>Status: </strong>
                                <span style={{
                                    color: status.color,
                                    fontWeight: 'bold',
                                    padding: '0.25rem 0.5rem',
                                    background: `${status.color}20`,
                                    borderRadius: '0.25rem'
                                }}>
                                    {status.label}
                                </span>

                                {!post.isValid && (
                                    <p style={{ color: 'red', marginTop: '0.25rem' }}>
                                        Reason: {post.validationReason}
                                    </p>
                                )}

                                {post.published && post.publishedAt && (
                                    <p style={{ color: 'green', marginTop: '0.25rem' }}>
                                        Published on {new Date(post.publishedAt).toLocaleString()}
                                    </p>
                                )}

                                {post.publishError && (
                                    <p style={{ color: 'red', marginTop: '0.25rem' }}>
                                        Error: {post.publishError}
                                    </p>
                                )}
                            </div>

                            {/* Post Now button for valid, unpublished posts */}
                            {post.isValid && !post.published && (
                                <button
                                    className="btn"
                                    onClick={() => handlePublishPost(post.id)}
                                    disabled={publishing === post.id}
                                    style={{ width: '100%' }}
                                >
                                    {publishing === post.id ? 'Publishing...' : 'Post Now'}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
