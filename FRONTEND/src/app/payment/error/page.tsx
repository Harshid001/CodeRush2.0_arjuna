'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowLeft, RefreshCw, XCircle } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// ─── Inner Component ──────────────────────────────────────

function PaymentErrorInner() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const errorMessage = searchParams.get('error') || 'The transaction was declined by the facilitator.';
    const providerId = searchParams.get('providerId') || '';

    return (
        <div style={{ background: '#050505', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 100, paddingBottom: 100 }}>
                <div style={{ maxWidth: 500, width: '105%', padding: '48px 36px', borderRadius: 24, background: 'rgba(12,12,14,0.9)', border: '1px solid rgba(180,60,60,0.25)', boxShadow: '0 24px 60px rgba(0,0,0,0.6)', textAlign: 'center' }}>
                    
                    {/* Error Header */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, marginBottom: 28 }}>
                        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(180,60,60,0.1)', border: '1px solid rgba(180,60,60,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c06060', boxShadow: '0 0 20px rgba(180,60,60,0.15)' }}>
                            <AlertTriangle size={32} />
                        </div>
                        <div>
                            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 700, color: '#efefef', margin: 0 }}>
                                Payment Refused
                            </h2>
                            <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#666', marginTop: 4 }}>
                                x402 Protocol transaction was aborted by the node.
                            </p>
                        </div>
                    </div>

                    {/* Error details card */}
                    <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 16, padding: '16px 20px', textAlign: 'left', fontSize: 12, fontFamily: 'Inter', color: '#999', lineHeight: 1.6, marginBottom: 28 }}>
                        <span style={{ fontSize: 10, color: '#c06060', fontFamily: 'monospace', fontWeight: 600, display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>
                            REASON
                        </span>
                        <p style={{ margin: '0 0 10px 0', color: '#eee', fontWeight: 500 }}>
                            {errorMessage}
                        </p>
                        <span style={{ fontSize: 10, color: '#555', fontFamily: 'monospace', fontWeight: 650, display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>
                            RECOVERY SUGGESTION
                        </span>
                        <p style={{ margin: 0, color: '#777' }}>
                            Ensure your local MetaMask network is configured to Base Sepolia, reload and verify token balance is sufficient, or select a fallback provider node.
                        </p>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link
                            href="/marketplace"
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                padding: '11px 22px', borderRadius: 10,
                                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                                color: '#aaa', fontSize: 12, fontFamily: 'Inter', fontWeight: 600, textDecoration: 'none',
                                cursor: 'pointer', transition: 'all 0.2s',
                            }}
                        >
                            Cancel
                        </Link>
                        
                        <button
                            onClick={() => router.push(`/payment?providerId=${providerId}`)}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                padding: '11px 22px', borderRadius: 10,
                                background: '#efefef', color: '#050505',
                                fontFamily: 'Inter', fontSize: 12, fontWeight: 700,
                                cursor: 'pointer', transition: 'all 0.2s',
                                border: 'none'
                            }}
                        >
                            <RefreshCw size={13} /> Retry Transaction
                        </button>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default function PaymentErrorPage() {
    return (
        <Suspense fallback={
            <div style={{ background: '#050505', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#666' }}>Loading error details...</p>
            </div>
        }>
            <PaymentErrorInner />
        </Suspense>
    );
}
