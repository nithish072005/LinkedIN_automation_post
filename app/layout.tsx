import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-inter',
});

export const metadata: Metadata = {
    title: 'PostPilot — LinkedIn Content Automation',
    description: 'AI-powered LinkedIn content generation and scheduling platform. Automate your LinkedIn presence with intelligent post creation.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={inter.variable}>
            <body>{children}</body>
        </html>
    );
}
