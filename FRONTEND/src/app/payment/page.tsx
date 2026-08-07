'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Wallet, Globe, Lock, Cpu, Star, Clock, AlertCircle, Award, CheckCircle2, ChevronRight, Zap } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { apis } from '@/lib/data/marketplaceApis';
import { useWallet } from '@txnlab/use-wallet-react';
import { formatCurrency } from '@/lib/utils';

// ─── Helpers ──────────────────────────────────────────────

function parsePrice(p: string): number {
    return parseFloat(p.replace(/[^0-9.]/g, '')) || 0;
}

function computeOverallScore(api: any): number {
    const q = api.qualityScore * 0.4;
    const priceVal = parsePrice(api.price);
    const pScore = Math.max(0, (1 - priceVal / 0.01)) * 100 * 0.3;
    const r = (api.reliability ?? 99) * 0.2;
    const l = Math.max(0, (1 - (api.latency ?? 500) / 5000)) * 100 * 0.1;
    return Math.round((q + pScore + r + l) * 10) / 10;
}

// ─── Inner Component ──────────────────────────────────────

function PaymentCheckoutInner() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { activeAddress: connectedAddress } = useWallet();
    const isConnected = !!connectedAddress;

    const providerId = searchParams.get('providerId');
    const api = apis.find(a => a.id === providerId) || apis[0];

    const overallScore = computeOverallScore(api);
    const apiPrice = parsePrice(api.price);
    const estGas = 0.0003; // mock gas in ETH
    const gasUsd = estGas * 3500; // mock rate
    const platformFee = 0.00; // Free
    const totalCost = apiPrice + gasUsd + platformFee;

    const displayAddress = connectedAddress || "0x71C83B47c04E923a10F8721102910a9E23";

    const handleProceedToPayment = () => {
        router.push(`/payment/processing?providerId=${api.id}`);
    };

    return (
        <div style={{ background: '#050505', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main style={{ flex: 1, paddingTop: 100, paddingBottom: 120 }}>
                <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 28px' }}>
                    
                    {/* Header Back Button */}
                    <button
                        onClick={() => router.back()}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            color: '#777', fontFamily: 'Inter', fontSize: 13, textDecoration: 'none',
                            background: 'none', border: 'none', cursor: 'pointer',
                            marginBottom: 36, transition: 'color 0.2s',
                        }}
                    >
                        <ArrowLeft size={14} /> Back to Advisor
                    </button>

                    {/* Section 1: Checkout Header */}
                    <div style={{ marginBottom: 40, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <Shield size={20} color="#5a9a5a" />
                            <span style={{ fontSize: 11, fontFamily: 'monospace', fontWeight: 700, color: '#5a9a5a', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                                Secure Checkout
                            </span>
                        </div>
                        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', color: '#efefef', margin: 0 }}>
                            x402 Protected Payment
                        </h1>
                        <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#666', marginTop: 4 }}>
                            Review your purchase parameters and authenticate the simulated execution session.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32, alignItems: 'flex-start' }} className="checkout-layout">
                        
                        {/* Left Column: Specs & Connected Wallet */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                            
                            {/* Section 2: Provider Details Card */}
                            <div style={{
                                padding: 24, borderRadius: 20,
                                background: 'rgba(12,12,14,0.9)', border: '1px solid rgba(255,255,255,0.06)',
                                display: 'flex', flexDirection: 'column', gap: 16
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <span style={{ fontSize: 10, fontFamily: 'Inter', fontWeight: 650, color: '#5a9a5a', background: 'rgba(90,154,90,0.1)', border: '1px solid rgba(90,154,90,0.2)', padding: '2px 8px', borderRadius: 6 }}>
                                            {api.cat}
                                        </span>
                                        <h3 style={{ fontFamily: 'Inter', fontSize: 18, fontWeight: 700, color: '#efefef', marginTop: 10, margin: '8px 0 2px' }}>
                                            {api.name}
                                        </h3>
                                        <span style={{ fontSize: 11, color: '#666', fontFamily: 'Inter' }}>by {api.provider}</span>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ fontSize: 10, color: '#555', fontFamily: 'Inter', display: 'block' }}>Decision Score</span>
                                        <span style={{ fontSize: 24, fontWeight: 800, color: '#5a9a5a', fontFamily: 'Inter' }}>
                                            {overallScore} <span style={{ fontSize: 12, color: '#666', fontWeight: 400 }}>/100</span>
                                        </span>
                                    </div>
                                </div>
                                <p style={{ fontSize: 13, fontFamily: 'Inter', color: '#999', lineHeight: 1.5, margin: 0 }}>
                                    {api.desc}
                                </p>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 16 }}>
                                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 12, border: '1px solid rgba(255,255,255,0.04)' }}>
                                        <span style={{ fontSize: 9, color: '#555', fontFamily: 'monospace', display: 'block', marginBottom: 2 }}>QUALITY</span>
                                        <span style={{ fontSize: 13, color: '#ddd', fontFamily: 'Inter', fontWeight: 600 }}>{api.qualityScore}%</span>
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 12, border: '1px solid rgba(255,255,255,0.04)' }}>
                                        <span style={{ fontSize: 9, color: '#555', fontFamily: 'monospace', display: 'block', marginBottom: 2 }}>LATENCY</span>
                                        <span style={{ fontSize: 13, color: '#ddd', fontFamily: 'Inter', fontWeight: 600 }}>{api.latency || 120}ms</span>
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 12, border: '1px solid rgba(255,255,255,0.04)' }}>
                                        <span style={{ fontSize: 9, color: '#555', fontFamily: 'monospace', display: 'block', marginBottom: 2 }}>RELIABILITY</span>
                                        <span style={{ fontSize: 13, color: '#ddd', fontFamily: 'Inter', fontWeight: 600 }}>{api.reliability || 99.9}%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Section 4: Wallet Connections */}
                            <div style={{
                                padding: 20, borderRadius: 20,
                                background: 'rgba(12,12,14,0.9)', border: '1px solid rgba(255,255,255,0.06)',
                                display: 'flex', flexDirection: 'column', gap: 14
                            }}>
                                <h4 style={{ fontSize: 11, fontFamily: 'Inter', fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                                    Authorized Payment Account
                                </h4>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                                            <Wallet size={18} />
                                        </div>
                                        <div>
                                            <span style={{ fontSize: 12, fontWeight: 600, color: '#ddd', fontFamily: 'monospace' }}>
                                                {displayAddress.slice(0, 6)}...{displayAddress.slice(-4)}
                                            </span>
                                            <span style={{ fontSize: 10, color: '#666', fontFamily: 'Inter', display: 'block', marginTop: 2 }}>
                                                {isConnected ? 'MetaMask Connection Active' : 'Simulated Wallet Connected'}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(232,168,56,0.1)', border: '1px solid rgba(232,168,56,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e8a838' }}>
                                            <Globe size={18} />
                                        </div>
                                        <div>
                                            <span style={{ fontSize: 12, fontWeight: 600, color: '#ddd', fontFamily: 'Inter' }}>
                                                Base Sepolia
                                            </span>
                                            <span style={{ fontSize: 10, color: '#666', fontFamily: 'Inter', display: 'block', marginTop: 2 }}>
                                                Chain ID: 84532
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 5: Purchase Timeline */}
                            <div style={{
                                padding: 24, borderRadius: 20,
                                background: 'rgba(12,12,14,0.9)', border: '1px solid rgba(255,255,255,0.06)',
                            }}>
                                <h4 style={{ fontSize: 11, fontFamily: 'Inter', fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 20 }}>
                                    Procurement Steps Timeline
                                </h4>
                                <div style={{ borderLeft: '2px solid rgba(255,255,255,0.05)', paddingLeft: 18, marginLeft: 8, display: 'flex', flexDirection: 'column', gap: 20 }}>
                                    {[
                                        { label: 'Provider Selected', detail: `Identified optimal node: ${api.name}`, done: true },
                                        { label: 'AI Decision Evaluation Completed', detail: 'Weights parsed: Quality, Price, Uptime, Latency', done: true },
                                        { label: 'Ready For Payment Signature', detail: 'Secure checkout payload constructed', done: 'current' },
                                        { label: 'Provider Node Execution', detail: 'simulated execution triggered post-settlement', done: false },
                                        { label: 'Receipt Generation', detail: 'Immutable record stored in PaymentContext', done: false }
                                    ].map((step, idx) => (
                                        <div key={idx} style={{ position: 'relative' }}>
                                            {/* Dot Badge */}
                                            <div style={{
                                                position: 'absolute', left: -25, top: 3,
                                                width: 12, height: 12, borderRadius: '50%',
                                                background: step.done === true ? '#5a9a5a' : step.done === 'current' ? '#e8a838' : '#1a1a1a',
                                                border: `2px solid ${step.done === true ? '#5a9a5a' : step.done === 'current' ? '#e8a838' : '#333'}`,
                                            }} />
                                            <div>
                                                <span style={{ fontSize: 13, fontFamily: 'Inter', fontWeight: 600, color: step.done ? '#ddd' : '#555' }}>
                                                    {step.label}
                                                </span>
                                                <p style={{ fontSize: 11, fontFamily: 'Inter', color: '#666', marginTop: 2 }}>
                                                    {step.detail}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Pricing & Security Details */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            
                            {/* Section 3: Pricing Summary Card */}
                            <div style={{
                                padding: 24, borderRadius: 20,
                                background: 'linear-gradient(155deg, rgba(22,22,26,0.95) 0%, rgba(12,12,14,0.95) 100%)',
                                border: '1px solid rgba(255,255,255,0.07)',
                                boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
                            }}>
                                <h3 style={{
                                    fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700,
                                    textTransform: 'uppercase', letterSpacing: '0.08em', color: '#555', marginBottom: 20
                                }}>
                                    Summary
                                </h3>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontFamily: 'Inter', color: '#888' }}>
                                        <span>API Usage Cost</span>
                                        <span style={{ color: '#ccc', fontWeight: 600 }}>{api.price}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontFamily: 'Inter', color: '#888' }}>
                                        <span>Estimated Gas Fee</span>
                                        <span style={{ color: '#ccc', fontWeight: 600 }}>~${gasUsd.toFixed(4)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontFamily: 'Inter', color: '#888' }}>
                                        <span>Platform Service Fee</span>
                                        <span style={{ color: '#5a9a5a', fontWeight: 600 }}>Free</span>
                                    </div>
                                </div>

                                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16, marginBottom: 28 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                        <span style={{ fontSize: 14, fontWeight: 700, color: '#e0e0e0', fontFamily: 'Inter' }}>Total Authorized</span>
                                        <span style={{ fontSize: 24, fontWeight: 800, color: '#e0e0e0', fontFamily: 'Inter' }}>
                                            ${totalCost.toFixed(4)}
                                            <span style={{ fontSize: 12, color: '#666', fontWeight: 400, marginLeft: 4 }}>USD</span>
                                        </span>
                                    </div>
                                    <span style={{ fontSize: 10, color: '#444', fontFamily: 'Inter', display: 'block', marginTop: 4 }}>
                                        * Billing scheme set to provider max limit: {api.model}
                                    </span>
                                </div>

                                <motion.button
                                    onClick={handleProceedToPayment}
                                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                    style={{
                                        width: '100%', padding: '14px', borderRadius: 12,
                                        background: '#efefef', color: '#050505',
                                        fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700,
                                        border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', gap: 6, boxShadow: '0 8px 24px rgba(239,239,239,0.12)',
                                        marginBottom: 12
                                    }}
                                >
                                    <Zap size={14} fill="#050505" /> Confirm & Authorize
                                </motion.button>
                            </div>

                            {/* Section 6: Security Parameters */}
                            <div style={{
                                padding: 20, borderRadius: 20,
                                background: 'rgba(12,12,14,0.6)', border: '1px solid rgba(255,255,255,0.04)',
                                display: 'flex', flexDirection: 'column', gap: 12
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#5a9a5a', fontSize: 12, fontWeight: 600, fontFamily: 'Inter' }}>
                                    <Lock size={12} /> Protected Parameters
                                </div>
                                <div style={{ fontSize: 11, fontFamily: 'Inter', color: '#666', lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <div>• Verified payload structure using Base Sepolia test networks</div>
                                    <div>• Wallet Signature Required to authenticate execution nonce</div>
                                    <div>• Pay Only Once - no automated monthly subscription commitments</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
            <style>{`
                @media (max-width: 800px) {
                    .checkout-layout {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
}

export default function PaymentCheckoutPage() {
    return (
        <Suspense fallback={
            <div style={{ background: '#050505', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#666' }}>Loading Secure Checkout...</p>
            </div>
        }>
            <PaymentCheckoutInner />
        </Suspense>
    );
}
