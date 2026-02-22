'use client';

import { useState, useEffect } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

export default function SettingsForm() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [linkedinStatus, setLinkedinStatus] = useState<{
        connected: boolean;
        connectedAt?: string;
        tokenExpired?: boolean;
    }>({ connected: false });
    const [formData, setFormData] = useState({
        productService: '',
        targetCustomer: '',
        coreProblem: '',
        uniqueAngle: '',
    });

    useEffect(() => {
        fetch('/api/settings')
            .then((res) => res.json())
            .then((data) => {
                if (data.id) setFormData(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));

        fetch('/api/linkedin/connect')
            .then((res) => res.json())
            .then((data) => setLinkedinStatus(data))
            .catch(() => { });
    }, []);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await fetch('/api/settings', {
                method: 'POST',
                body: JSON.stringify(formData),
                headers: { 'Content-Type': 'application/json' },
            });
            showToast('Configuration saved successfully', 'success');
        } catch {
            showToast('Failed to save configuration', 'error');
        }
        setSaving(false);
    };

    const handleLinkedInConnect = () => {
        window.location.href = '/api/auth/linkedin';
    };

    const handleLinkedInDisconnect = async () => {
        if (!confirm('Are you sure you want to disconnect your LinkedIn account?')) {
            return;
        }

        try {
            await fetch('/api/linkedin/connect', { method: 'DELETE' });
            setLinkedinStatus({ connected: false });
            showToast('LinkedIn disconnected successfully', 'success');
        } catch {
            showToast('Failed to disconnect LinkedIn', 'error');
        }
    };

    if (loading) {
        return (
            <div className="empty-state">
                <LoadingSpinner />
                <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>Loading settings...</p>
            </div>
        );
    }

    return (
        <>
            <div className="settings-grid">
                {/* Business Configuration */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <h2 className="card-title">Business Configuration</h2>
                            <p className="card-subtitle">Define your content generation parameters</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Product / Service</label>
                            <textarea
                                className="form-textarea"
                                rows={2}
                                value={formData.productService}
                                onChange={(e) => setFormData({ ...formData, productService: e.target.value })}
                                placeholder="Describe your product or service..."
                                required
                            />
                            <p className="form-help">What do you offer? Be specific for better content.</p>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Target Customer</label>
                            <textarea
                                className="form-textarea"
                                rows={2}
                                value={formData.targetCustomer}
                                onChange={(e) => setFormData({ ...formData, targetCustomer: e.target.value })}
                                placeholder="Who is your ideal customer?"
                                required
                            />
                            <p className="form-help">Include job titles, industries, or company sizes.</p>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Core Problem</label>
                            <textarea
                                className="form-textarea"
                                rows={2}
                                value={formData.coreProblem}
                                onChange={(e) => setFormData({ ...formData, coreProblem: e.target.value })}
                                placeholder="What main problem do you solve?"
                                required
                            />
                            <p className="form-help">The primary pain point your audience faces.</p>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Unique Angle</label>
                            <textarea
                                className="form-textarea"
                                rows={2}
                                value={formData.uniqueAngle}
                                onChange={(e) => setFormData({ ...formData, uniqueAngle: e.target.value })}
                                placeholder="What makes your approach different?"
                                required
                            />
                            <p className="form-help">Your competitive advantage or unique perspective.</p>
                        </div>

                        <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={saving}>
                            {saving ? (
                                <>
                                    <span className="spinner spinner-sm" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="16" height="16">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                    </svg>
                                    Save Configuration
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* LinkedIn Integration */}
                <div className="linkedin-card">
                    <div className="card-header">
                        <div>
                            <h2 className="card-title">LinkedIn Integration</h2>
                            <p className="card-subtitle">Connect your account for automatic posting</p>
                        </div>
                        <svg viewBox="0 0 24 24" fill="#0A66C2" width="28" height="28">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                    </div>

                    <hr className="card-divider" />

                    {linkedinStatus.connected && !linkedinStatus.tokenExpired ? (
                        <div>
                            <div className="linkedin-status">
                                <span className="linkedin-status-dot connected" />
                                <div>
                                    <span className="linkedin-status-text" style={{ color: 'var(--accent)' }}>Connected</span>
                                    {linkedinStatus.connectedAt && (
                                        <p className="linkedin-status-date">
                                            Since {new Date(linkedinStatus.connectedAt).toLocaleDateString('en-US', {
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="alert alert-success mt-2">
                                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                                <span>Your LinkedIn account is connected and ready for automatic posting.</span>
                            </div>

                            <button
                                type="button"
                                className="btn btn-danger btn-full mt-2"
                                onClick={handleLinkedInDisconnect}
                            >
                                Disconnect LinkedIn
                            </button>
                        </div>
                    ) : linkedinStatus.tokenExpired ? (
                        <div>
                            <div className="linkedin-status">
                                <span className="linkedin-status-dot expired" />
                                <div>
                                    <span className="linkedin-status-text" style={{ color: 'var(--warning)' }}>Token Expired</span>
                                </div>
                            </div>

                            <div className="alert alert-warning mt-2">
                                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                                </svg>
                                <span>Your LinkedIn access token has expired. Reconnect to resume automatic posting.</span>
                            </div>

                            <button
                                type="button"
                                className="btn btn-primary btn-full mt-2"
                                onClick={handleLinkedInConnect}
                            >
                                Reconnect LinkedIn
                            </button>
                        </div>
                    ) : (
                        <div>
                            <div className="linkedin-status">
                                <span className="linkedin-status-dot disconnected" />
                                <div>
                                    <span className="linkedin-status-text">Not Connected</span>
                                </div>
                            </div>

                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '1rem 0' }}>
                                Connect your LinkedIn account to enable one-click publishing and automatic posting of AI-generated content.
                            </p>

                            <button
                                type="button"
                                className="btn btn-primary btn-lg btn-full"
                                onClick={handleLinkedInConnect}
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                                Connect LinkedIn Account
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Toast Notification */}
            {toast && (
                <div className={`toast toast-${toast.type}`}>
                    {toast.message}
                </div>
            )}
        </>
    );
}
