import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'LinkedIn Post Generator',
    description: 'Automated AI LinkedIn posts',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
