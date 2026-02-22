'use client';

import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import SettingsForm from './components/SettingsForm';
import PostHistory from './components/PostHistory';

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [linkedinConnected, setLinkedinConnected] = useState(false);

    useEffect(() => {
        fetch('/api/linkedin/connect')
            .then((res) => res.json())
            .then((data) => {
                setLinkedinConnected(data.connected && !data.tokenExpired);
            })
            .catch(() => { });
    }, []);

    const getPageTitle = () => {
        switch (activeTab) {
            case 'dashboard': return 'Dashboard';
            case 'content': return 'Content';
            case 'settings': return 'Settings';
            default: return 'Dashboard';
        }
    };

    const getPageSubtitle = () => {
        switch (activeTab) {
            case 'dashboard': return 'Overview of your LinkedIn content pipeline';
            case 'content': return 'Manage and review your generated posts';
            case 'settings': return 'Configure your business profile and integrations';
            default: return '';
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'settings':
                return <SettingsForm />;
            case 'content':
            case 'dashboard':
            default:
                return <PostHistory />;
        }
    };

    return (
        <div className="app-layout">
            <Sidebar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                linkedinConnected={linkedinConnected}
            />

            <div className="main-content">
                <header className="main-header">
                    <div>
                        <h1 className="main-header-title">{getPageTitle()}</h1>
                        <p className="main-header-subtitle">{getPageSubtitle()}</p>
                    </div>
                </header>

                <main className="main-body">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}
