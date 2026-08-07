'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, FileText, LayoutDashboard, Download, ExternalLink, RefreshCw, FileCode } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { usePaymentContext } from '@/context/PaymentContext';
import { formatCurrency } from '@/lib/utils';

// ─── Inner Component ──────────────────────────────────────

function PaymentSuccessInner() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { receipts, setActiveTraceId } = usePaymentContext();

    const receiptId = searchParams.get('receiptId');
    const receipt = receipts.find(r => r.id === receiptId);

    const [executionResult, setExecutionResult] = useState<any>(null);

    useEffect(() => {
        if (receiptId && typeof window !== 'undefined') {
            const cached = sessionStorage.getItem(`result-${receiptId}`);
            if (cached) {
                try {
                    setExecutionResult(JSON.parse(cached));
                } catch (e) {
                    console.error("Failed to parse cached result", e);
                }
            }
        }
    }, [receiptId]);

    const handleDownloadJson = () => {
        if (!receipt) return;
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(receipt, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `receipt-${receipt.id}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    };

    const handleViewTrace = () => {
        if (receipt) {
            setActiveTraceId(receipt.id);
            router.push('/dashboard');
        }
    };

    return (
        <div style={{ background: '#050505', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 100, paddingBottom: 100 }}>
                <div style={{ maxWidth: 640, width: '105%', padding: '48px 36px', borderRadius: 24, background: 'rgba(12,12,14,0.9)', border: '1px solid rgba(90,154,90,0.25)', boxShadow: '0 24px 60px rgba(0,0,0,0.6)', textAlign: 'center' }}>
                    
                    {/* Success Header */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, marginBottom: 32 }}>
                        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(90,154,90,0.1)', border: '1px solid rgba(90,154,90,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5a9a5a', boxShadow: '0 0 20px rgba(90,154,90,0.15)' }}>
                            <CheckCircle2 size={32} />
                        </div>
                        <div>
                            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 700, color: '#efefef', margin: 0 }}>
                                Payment Successful
                            </h2>
                            <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#666', marginTop: 4 }}>
                                Provider node executed and cryptographic receipt generated.
                            </p>
                        </div>
                    </div>

                    {/* Receipt Details Card */}
                    {receipt ? (
                        <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 16, padding: 20, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 12, fontSize: 12, fontFamily: 'Inter', marginBottom: 24 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: 8 }}>
                                <span style={{ color: '#555' }}>Receipt ID</span>
                                <span style={{ fontFamily: 'monospace', color: '#ddd' }}>{receipt.id}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: 8 }}>
                                <span style={{ color: '#555' }}>Provider</span>
                                <span style={{ fontWeight: 600, color: '#ddd' }}>{receipt.providerName}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: 8 }}>
                                <span style={{ color: '#555' }}>Network</span>
                                <span style={{ fontFamily: 'monospace', color: '#ddd', textTransform: 'uppercase' }}>{receipt.requirement.network}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: 8 }}>
                                <span style={{ color: '#555' }}>TX Settlement Hash</span>
                                <span style={{ fontFamily: 'monospace', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>
                                    {receipt.settlement.settlementId}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#555' }}>Amount Settled</span>
                                <span style={{ fontFamily: 'monospace', color: '#5a9a5a', fontWeight: 700, fontSize: 14 }}>
                                    {formatCurrency(receipt.costActual)} USD
                                </span>
                            </div>
                        </div>
                    ) : (
                        <p style={{ color: '#555', fontSize: 12, marginBottom: 24 }}>Receipt data not loaded. Check dashboard for traces.</p>
                    )}

                    {/* API Execution Output */}
                    {executionResult && (
                        <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 16, padding: 16, textAlign: 'left', marginBottom: 28 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: '#3b82f6', fontFamily: 'monospace', marginBottom: 10 }}>
                                <FileCode size={13} /> execution_output
                            </div>
                            <pre style={{ margin: 0, padding: 12, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 10, fontSize: 11, fontFamily: 'monospace', color: '#5a9a5a', overflowX: 'auto', maxHeight: 150 }}>
                                {JSON.stringify(executionResult, null, 2)}
                            </pre>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                            onClick={handleDownloadJson}
                            disabled={!receipt}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                padding: '10px 18px', borderRadius: 10,
                                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                                color: '#aaa', fontSize: 12, fontFamily: 'Inter', fontWeight: 600,
                                cursor: 'pointer', transition: 'all 0.2s',
                            }}
                        >
                            <Download size={13} /> Download JSON
                        </button>
                        
                        <button
                            onClick={handleViewTrace}
                            disabled={!receipt}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                padding: '10px 18px', borderRadius: 10,
                                background: 'rgba(90,154,90,0.1)', border: '1px solid rgba(90,154,90,0.25)',
                                color: '#5a9a5a', fontSize: 12, fontFamily: 'Inter', fontWeight: 600,
                                cursor: 'pointer', transition: 'all 0.2s',
                            }}
                        >
                            <ExternalLink size={13} /> View Receipt Trace
                        </button>

                        <Link
                            href="/dashboard"
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                padding: '10px 18px', borderRadius: 10,
                                background: '#efefef', color: '#050505',
                                fontFamily: 'Inter', fontSize: 12, fontWeight: 600, textDecoration: 'none',
                                cursor: 'pointer', transition: 'all 0.2s',
                            }}
                        >
                            <LayoutDashboard size={13} /> Return to Dashboard
                        </Link>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={
            <div style={{ background: '#050505', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#666' }}>Loading Success details...</p>
            </div>
        }>
            <PaymentSuccessInner />
        </Suspense>
    );
}
