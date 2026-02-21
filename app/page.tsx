'use client';

import { useState, useEffect } from 'react';
import SettingsForm from './components/SettingsForm';
import PostHistory from './components/PostHistory';

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'settings'>('dashboard');

    return (
        <div className="container">
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>LinkedIn Generator</h1>
                <nav style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        className={`btn ${activeTab === 'dashboard' ? '' : 'btn-secondary'}`}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        Dashboard
                    </button>
                    <button
                        className={`btn ${activeTab === 'settings' ? '' : 'btn-secondary'}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        Settings
                    </button>
                </nav>
            </header>

            <main>
                {activeTab === 'dashboard' ? <PostHistory /> : <SettingsForm />}
            </main>
        </div>
    );
}
