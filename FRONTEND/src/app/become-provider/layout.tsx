'use client';

import { Toaster } from 'sonner';

export default function BecomeProviderLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            {children}
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: '#101012',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#e0e0e0',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 13,
                        boxShadow: '0 24px 48px rgba(0,0,0,0.6)',
                    },
                }}
            />
        </>
    );
}
