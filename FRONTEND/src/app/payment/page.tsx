'use client';

import React, { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Shield, Wallet, Globe, Lock, Star, Clock, AlertCircle, CheckCircle2, ChevronRight, Zap, RefreshCw, XCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { apis } from '@/lib/data/marketplaceApis';
import { useWallet, WalletId } from '@txnlab/use-wallet-react';
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

type WalletConnectStatus = 'disconnected' | 'connecting' | 'connected' | 'error' | 'demo';

// ─── Inner Component ──────────────────────────────────────

function PaymentCheckoutInner() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { activeAddress: connectedAddress, wallets, activeAccount, signTransactions } = useWallet();
    const [mounted, setMounted] = useState(false);
    const [walletStatus, setWalletStatus] = useState<WalletConnectStatus>('disconnected');
    const [walletError, setWalletError] = useState<string | null>(null);
    const [demoMode, setDemoMode] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Keep wallet status in sync with useWallet
    useEffect(() => {
        if (!mounted) return;
        if (connectedAddress) {
            setWalletStatus('connected');
            setWalletError(null);
            setDemoMode(false);
        } else if (!demoMode) {
            setWalletStatus('disconnected');
        }
    }, [connectedAddress, mounted, demoMode]);

    const isConnected = mounted && !!connectedAddress;
    const isReady = isConnected || demoMode;

    const providerId = searchParams.get('providerId');
    const api = apis.find(a => a.id === providerId) || apis[0];

    const overallScore = computeOverallScore(api);
    const apiPrice = parsePrice(api.price);
    const estGas = 0.001;
    const gasUsd = estGas * 0.20;
    const platformFee = 0.00;
    const totalCost = apiPrice + gasUsd + platformFee;

    const displayAddress = mounted && connectedAddress
        ? connectedAddress
        : demoMode
            ? '36UMZNGBAZMINJH7266YYGHTR2OLEHTFRREB6ROQI3XA54EQXXCLTZTMG4'
            : null;

    // ── Connect Lute ────────────────────────────────────────
    const handleConnectLute = useCallback(async () => {
        setWalletError(null);
        const luteWallet = wallets?.find((w: any) => w.id === WalletId.LUTE);

        if (!luteWallet) {
            setWalletError('Lute wallet extension not detected. Install Lute or use Demo Mode below.');
            setWalletStatus('error');
            return;
        }

        if (luteWallet.isConnected) {
            setWalletStatus('connected');
            return;
        }

        setWalletStatus('connecting');
        try {
            await luteWallet.connect();
            setWalletStatus('connected');
            setWalletError(null);
        } catch (err: any) {
            const msg: string = err?.message ?? String(err);
            if (msg.includes('User Rejected') || msg.includes('user rejected') || err?.code === 4100) {
                setWalletError('Connection rejected by user in Lute Wallet.');
            } else if (msg.includes('Could not establish connection') || msg.includes('Receiving end does not exist')) {
                setWalletError('Lute extension connection lost. Please refresh and try again.');
            } else {
                setWalletError(`Wallet error: ${msg}`);
            }
            setWalletStatus('error');
        }
    }, [wallets]);

    const handleDisconnect = useCallback(() => {
        const luteWallet = wallets?.find((w: any) => w.id === WalletId.LUTE);
        if (luteWallet?.isConnected) {
            luteWallet.disconnect();
        }
        setWalletStatus('disconnected');
        setDemoMode(false);
        setWalletError(null);
    }, [wallets]);

    const handleDemoMode = () => {
        setDemoMode(true);
        setWalletStatus('demo');
        setWalletError(null);
    };

    const handleProceedToPayment = () => {
        router.push(`/payment/processing?providerId=${api.id}&demo=${demoMode ? '1' : '0'}`);
    };

    // ── Wallet status badge ──────────────────────────────────
    const statusBadge = {
        disconnected: { color: '#555', bg: 'rgba(80,80,80,0.1)', border: 'rgba(80,80,80,0.2)', label: 'Not Connected' },
        connecting:   { color: '#e8a838', bg: 'rgba(232,168,56,0.1)', border: 'rgba(232,168,56,0.2)', label: 'Connecting…' },
        connected:    { color: '#5a9a5a', bg: 'rgba(90,154,90,0.1)', border: 'rgba(90,154,90,0.2)', label: 'Lute Connected ✓' },
        error:        { color: '#e05555', bg: 'rgba(224,85,85,0.1)', border: 'rgba(224,85,85,0.2)', label: 'Connection Failed' },
        demo:         { color: '#7b68ee', bg: 'rgba(123,104,238,0.1)', border: 'rgba(123,104,238,0.2)', label: 'Demo Mode Active' },
    }[walletStatus];

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
                            color: '#777', fontFamily: 'Inter', fontSize: 13,
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
                            Connect your Lute wallet on Algorand TestNet to authorize on-chain settlement.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32, alignItems: 'flex-start' }} className="checkout-layout">

                        {/* Left Column */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                            {/* Provider Details Card */}
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
                                        <h3 style={{ fontFamily: 'Inter', fontSize: 18, fontWeight: 700, color: '#efefef', margin: '8px 0 2px' }}>
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
                                    {[
                                        { label: 'QUALITY', val: `${api.qualityScore}%` },
                                        { label: 'LATENCY', val: `${api.latency || 120}ms` },
                                        { label: 'RELIABILITY', val: `${api.reliability || 99.9}%` },
                                    ].map(({ label, val }) => (
                                        <div key={label} style={{ background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 12, border: '1px solid rgba(255,255,255,0.04)' }}>
                                            <span style={{ fontSize: 9, color: '#555', fontFamily: 'monospace', display: 'block', marginBottom: 2 }}>{label}</span>
                                            <span style={{ fontSize: 13, color: '#ddd', fontFamily: 'Inter', fontWeight: 600 }}>{val}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* ── LUTE WALLET CONNECTION CARD ── */}
                            <div style={{
                                padding: 24, borderRadius: 20,
                                background: 'rgba(12,12,14,0.9)',
                                border: `1px solid ${statusBadge.border}`,
                                display: 'flex', flexDirection: 'column', gap: 16,
                                transition: 'border-color 0.3s',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <h4 style={{ fontSize: 11, fontFamily: 'Inter', fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                                        Lute Wallet — Algorand TestNet
                                    </h4>
                                    <span style={{
                                        fontSize: 10, fontFamily: 'Inter', fontWeight: 700,
                                        color: statusBadge.color,
                                        background: statusBadge.bg,
                                        border: `1px solid ${statusBadge.border}`,
                                        borderRadius: 20, padding: '3px 10px',
                                    }}>
                                        {statusBadge.label}
                                    </span>
                                </div>

                                {/* Connected state */}
                                <AnimatePresence mode="wait">
                                    {(isConnected || demoMode) && (
                                        <motion.div
                                            key="connected"
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{
                                                    width: 44, height: 44, borderRadius: 12,
                                                    background: demoMode ? 'rgba(123,104,238,0.1)' : 'rgba(90,154,90,0.1)',
                                                    border: `1px solid ${demoMode ? 'rgba(123,104,238,0.25)' : 'rgba(90,154,90,0.25)'}`,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: demoMode ? '#7b68ee' : '#5a9a5a',
                                                }}>
                                                    <Wallet size={20} />
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: 13, fontWeight: 700, color: '#e0e0e0', fontFamily: 'monospace', letterSpacing: '0.02em' }}>
                                                        {displayAddress ? `${displayAddress.slice(0, 8)}...${displayAddress.slice(-6)}` : '—'}
                                                    </div>
                                                    <div style={{ fontSize: 10, color: '#666', fontFamily: 'Inter', marginTop: 2 }}>
                                                        {demoMode ? 'Demo Wallet (Auto-Signed)' : 'Lute Wallet Active · TestNet'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#5a9a5a', fontSize: 11, fontFamily: 'Inter' }}>
                                                    <CheckCircle2 size={14} />
                                                    <span>Authorized</span>
                                                </div>
                                                <button
                                                    onClick={handleDisconnect}
                                                    style={{
                                                        fontSize: 10, color: '#555', fontFamily: 'Inter',
                                                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                                                        borderRadius: 8, padding: '4px 10px', cursor: 'pointer',
                                                    }}
                                                >
                                                    Disconnect
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {!isConnected && !demoMode && (
                                        <motion.div
                                            key="disconnected"
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
                                        >
                                            {walletError && (
                                                <div style={{
                                                    display: 'flex', alignItems: 'flex-start', gap: 8,
                                                    padding: '10px 14px', borderRadius: 10,
                                                    background: 'rgba(224,85,85,0.08)', border: '1px solid rgba(224,85,85,0.2)',
                                                }}>
                                                    <AlertCircle size={14} color="#e05555" style={{ flexShrink: 0, marginTop: 1 }} />
                                                    <span style={{ fontSize: 11, color: '#e05555', fontFamily: 'Inter', lineHeight: 1.5 }}>{walletError}</span>
                                                </div>
                                            )}

                                            {/* Primary: Connect Lute */}
                                            <motion.button
                                                onClick={handleConnectLute}
                                                disabled={walletStatus === 'connecting'}
                                                whileHover={{ scale: walletStatus === 'connecting' ? 1 : 1.02 }}
                                                whileTap={{ scale: walletStatus === 'connecting' ? 1 : 0.97 }}
                                                style={{
                                                    width: '100%', padding: '13px 20px', borderRadius: 12,
                                                    background: walletStatus === 'connecting'
                                                        ? 'rgba(232,168,56,0.08)'
                                                        : 'rgba(90,154,90,0.1)',
                                                    border: `1px solid ${walletStatus === 'connecting' ? 'rgba(232,168,56,0.3)' : 'rgba(90,154,90,0.3)'}`,
                                                    color: walletStatus === 'connecting' ? '#e8a838' : '#5a9a5a',
                                                    fontFamily: 'Inter', fontSize: 13, fontWeight: 700,
                                                    cursor: walletStatus === 'connecting' ? 'not-allowed' : 'pointer',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                                    transition: 'all 0.2s',
                                                }}
                                            >
                                                {walletStatus === 'connecting' ? (
                                                    <>
                                                        <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
                                                        Waiting for Lute…
                                                    </>
                                                ) : (
                                                    <>
                                                        <Wallet size={14} />
                                                        Connect Lute Wallet
                                                    </>
                                                )}
                                            </motion.button>

                                            {/* Network info */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.04)' }} />
                                                <span style={{ fontSize: 10, color: '#444', fontFamily: 'Inter' }}>Algorand TestNet · USDC ASA 10458941</span>
                                                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.04)' }} />
                                            </div>

                                            {/* Secondary: Demo Mode */}
                                            <button
                                                onClick={handleDemoMode}
                                                style={{
                                                    width: '100%', padding: '10px 20px', borderRadius: 12,
                                                    background: 'rgba(123,104,238,0.06)',
                                                    border: '1px solid rgba(123,104,238,0.2)',
                                                    color: '#7b68ee',
                                                    fontFamily: 'Inter', fontSize: 12, fontWeight: 600,
                                                    cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                                }}
                                            >
                                                <Zap size={12} />
                                                Continue in Demo / Auto-Sign Mode
                                            </button>

                                            <p style={{ fontSize: 10, color: '#444', fontFamily: 'Inter', textAlign: 'center', lineHeight: 1.5, margin: 0 }}>
                                                Don't have Lute?{' '}
                                                <a href="https://lute.app" target="_blank" rel="noreferrer" style={{ color: '#7b68ee', textDecoration: 'none' }}>
                                                    Install the extension <ExternalLink size={9} style={{ display: 'inline', verticalAlign: 'middle' }} />
                                                </a>
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Network row */}
                            <div style={{
                                padding: 16, borderRadius: 16,
                                background: 'rgba(12,12,14,0.6)', border: '1px solid rgba(255,255,255,0.04)',
                                display: 'flex', alignItems: 'center', gap: 12,
                            }}>
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(232,168,56,0.1)', border: '1px solid rgba(232,168,56,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e8a838' }}>
                                    <Globe size={16} />
                                </div>
                                <div>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: '#ddd', fontFamily: 'Inter' }}>Algorand TestNet</span>
                                    <span style={{ fontSize: 10, color: '#555', fontFamily: 'monospace', display: 'block', marginTop: 1 }}>CAIP-2: algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=</span>
                                </div>
                            </div>

                            {/* Timeline */}
                            <div style={{ padding: 24, borderRadius: 20, background: 'rgba(12,12,14,0.9)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <h4 style={{ fontSize: 11, fontFamily: 'Inter', fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 20 }}>
                                    Procurement Steps Timeline
                                </h4>
                                <div style={{ borderLeft: '2px solid rgba(255,255,255,0.05)', paddingLeft: 18, marginLeft: 8, display: 'flex', flexDirection: 'column', gap: 20 }}>
                                    {[
                                        { label: 'Provider Selected', detail: `Identified optimal node: ${api.name}`, done: true },
                                        { label: 'AI Decision Evaluation Completed', detail: 'Weights parsed: Quality, Price, Uptime, Latency', done: true },
                                        { label: 'Wallet Authorization', detail: isReady ? (demoMode ? 'Demo mode authorized' : 'Lute wallet connected on Algorand TestNet') : 'Connect Lute wallet to proceed', done: isReady ? true : 'current' },
                                        { label: 'Ready For Payment Signature', detail: 'Secure checkout payload constructed', done: isReady ? 'current' : false },
                                        { label: 'Provider Node Execution', detail: 'Execution triggered post-settlement', done: false },
                                        { label: 'Receipt Generation', detail: 'Immutable record stored in PaymentContext', done: false },
                                    ].map((step, idx) => (
                                        <div key={idx} style={{ position: 'relative' }}>
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

                        {/* Right Column: Pricing & CTA */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                            {/* Pricing Summary */}
                            <div style={{
                                padding: 24, borderRadius: 20,
                                background: 'linear-gradient(155deg, rgba(22,22,26,0.95) 0%, rgba(12,12,14,0.95) 100%)',
                                border: '1px solid rgba(255,255,255,0.07)',
                                boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
                            }}>
                                <h3 style={{
                                    fontFamily: 'Inter', fontSize: 12, fontWeight: 700,
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
                                        * Settlement via Algorand TestNet USDC (ASA 10458941)
                                    </span>
                                </div>

                                {/* Wallet gate message */}
                                {!isReady && (
                                    <div style={{
                                        padding: '10px 14px', borderRadius: 10, marginBottom: 12,
                                        background: 'rgba(232,168,56,0.06)', border: '1px solid rgba(232,168,56,0.2)',
                                        display: 'flex', alignItems: 'center', gap: 8,
                                    }}>
                                        <AlertCircle size={13} color="#e8a838" />
                                        <span style={{ fontSize: 11, color: '#e8a838', fontFamily: 'Inter' }}>
                                            Connect Lute wallet to authorize payment
                                        </span>
                                    </div>
                                )}

                                <motion.button
                                    onClick={handleProceedToPayment}
                                    disabled={!isReady}
                                    whileHover={{ scale: isReady ? 1.02 : 1 }}
                                    whileTap={{ scale: isReady ? 0.98 : 1 }}
                                    style={{
                                        width: '100%', padding: '14px', borderRadius: 12,
                                        background: isReady
                                            ? (demoMode ? '#7b68ee' : '#efefef')
                                            : 'rgba(255,255,255,0.06)',
                                        color: isReady ? (demoMode ? '#fff' : '#050505') : '#444',
                                        fontFamily: 'Inter', fontSize: 13, fontWeight: 700,
                                        border: 'none',
                                        cursor: isReady ? 'pointer' : 'not-allowed',
                                        display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', gap: 6,
                                        boxShadow: isReady ? '0 8px 24px rgba(239,239,239,0.12)' : 'none',
                                        marginBottom: 12,
                                        transition: 'all 0.25s',
                                    }}
                                >
                                    <Zap size={14} fill={isReady ? (demoMode ? '#fff' : '#050505') : '#444'} />
                                    {demoMode ? 'Confirm & Auto-Sign (Demo)' : 'Confirm & Authorize via Lute'}
                                </motion.button>
                            </div>

                            {/* Security Parameters */}
                            <div style={{
                                padding: 20, borderRadius: 20,
                                background: 'rgba(12,12,14,0.6)', border: '1px solid rgba(255,255,255,0.04)',
                                display: 'flex', flexDirection: 'column', gap: 12
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#5a9a5a', fontSize: 12, fontWeight: 600, fontFamily: 'Inter' }}>
                                    <Lock size={12} /> Protected Parameters
                                </div>
                                <div style={{ fontSize: 11, fontFamily: 'Inter', color: '#666', lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <div>• AVM Atomic Group Transaction — verified on-chain by GoPlausible facilitator</div>
                                    <div>• Lute Wallet Signature Required to authenticate execution nonce</div>
                                    <div>• Pay Only Once — no automated monthly subscription commitments</div>
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
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
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
