'use client';

import { useState, useEffect } from 'react';

export default function SettingsForm() {
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState('');
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
        // Load settings
        fetch('/api/settings')
            .then((res) => res.json())
            .then((data) => {
                if (data.id) setFormData(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));

        // Load LinkedIn connection status
        fetch('/api/linkedin/connect')
            .then((res) => res.json())
            .then((data) => setLinkedinStatus(data))
            .catch(() => { });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await fetch('/api/settings', {
            method: 'POST',
            body: JSON.stringify(formData),
            headers: { 'Content-Type': 'application/json' },
        });
        setMsg('Settings saved!');
        setLoading(false);
        setTimeout(() => setMsg(''), 3000);
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
            setMsg('LinkedIn disconnected successfully');
            setTimeout(() => setMsg(''), 3000);
        } catch (error) {
            setMsg('Failed to disconnect LinkedIn');
            setTimeout(() => setMsg(''), 3000);
        }
    };

    if (loading && !formData.productService) return <div>Loading settings...</div>;

    return (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Business Configuration</h2>
            <form onSubmit={handleSubmit} className="grid">
                <div>
                    <label className="label">Product / Service</label>
                    <textarea
                        className="input"
                        rows={2}
                        value={formData.productService}
                        onChange={(e) => setFormData({ ...formData, productService: e.target.value })}
                        required
                    />
                </div>
                <div>
                    <label className="label">Target Customer</label>
                    <textarea
                        className="input"
                        rows={2}
                        value={formData.targetCustomer}
                        onChange={(e) => setFormData({ ...formData, targetCustomer: e.target.value })}
                        required
                    />
                </div>
                <div>
                    <label className="label">Core Problem</label>
                    <textarea
                        className="input"
                        rows={2}
                        value={formData.coreProblem}
                        onChange={(e) => setFormData({ ...formData, coreProblem: e.target.value })}
                        required
                    />
                </div>
                <div>
                    <label className="label">Unique Angle</label>
                    <textarea
                        className="input"
                        rows={2}
                        value={formData.uniqueAngle}
                        onChange={(e) => setFormData({ ...formData, uniqueAngle: e.target.value })}
                        required
                    />
                </div>

                <button type="submit" className="btn" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Configuration'}
                </button>
                {msg && <p style={{ color: 'green', textAlign: 'center' }}>{msg}</p>}
            </form>

            {/* LinkedIn Connection Section */}
            <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #ddd' }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>LinkedIn Integration</h3>

                {linkedinStatus.connected && !linkedinStatus.tokenExpired ? (
                    <div>
                        <p style={{ color: 'green', marginBottom: '1rem' }}>
                            ✓ LinkedIn Connected
                            {linkedinStatus.connectedAt && (
                                <span style={{ fontSize: '0.875rem', color: '#666', marginLeft: '0.5rem' }}>
                                    (since {new Date(linkedinStatus.connectedAt).toLocaleDateString()})
                                </span>
                            )}
                        </p>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handleLinkedInDisconnect}
                        >
                            Disconnect LinkedIn
                        </button>
                    </div>
                ) : linkedinStatus.tokenExpired ? (
                    <div>
                        <p style={{ color: 'orange', marginBottom: '1rem' }}>
                            ⚠ LinkedIn token expired. Please reconnect.
                        </p>
                        <button
                            type="button"
                            className="btn"
                            onClick={handleLinkedInConnect}
                        >
                            Reconnect LinkedIn
                        </button>
                    </div>
                ) : (
                    <div>
                        <p style={{ color: '#666', marginBottom: '1rem' }}>
                            Connect your LinkedIn account to enable automatic posting.
                        </p>
                        <button
                            type="button"
                            className="btn"
                            onClick={handleLinkedInConnect}
                        >
                            Connect LinkedIn
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
