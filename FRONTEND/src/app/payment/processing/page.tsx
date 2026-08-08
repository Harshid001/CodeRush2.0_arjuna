'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Zap, CheckCircle2, ShieldAlert, Wallet, AlertCircle, RefreshCw } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LiveProvenanceStepper from '@/components/LiveProvenanceStepper';
import { usePaymentContext } from '@/context/PaymentContext';
import { useProviderContext } from '@/context/ProviderContext';
import { requestPaidResource } from '@/lib/x402/client';
import { apis } from '@/lib/data/marketplaceApis';
import { useWallet, WalletId } from '@txnlab/use-wallet-react';
import { ALGORAND_TESTNET_CAIP2 } from '@x402-avm/avm';
import type { Provider } from '@/lib/x402/types';

// ── Types ─────────────────────────────────────────────────────────────────────
type WalletPhase = 'init' | 'connecting' | 'signing' | 'processing' | 'done';

function WalletStatusBanner({
    phase,
    address,
    isDemo,
    onBypass,
}: {
    phase: WalletPhase;
    address: string | null;
    isDemo: boolean;
    onBypass: () => void;
}) {
    if (phase === 'done') return null;

    const configs: Record<WalletPhase, { color: string; bg: string; border: string; icon: React.ReactNode; msg: string }> = {
        init: {
            color: '#888', bg: 'rgba(80,80,80,0.08)', border: 'rgba(80,80,80,0.15)',
            icon: <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />,
            msg: 'Initialising wallet connection…',
        },
        connecting: {
            color: '#e8a838', bg: 'rgba(232,168,56,0.08)', border: 'rgba(232,168,56,0.2)',
            icon: <Wallet size={14} />,
            msg: 'Waiting for Lute wallet confirmation…',
        },
        signing: {
            color: '#7b68ee', bg: 'rgba(123,104,238,0.08)', border: 'rgba(123,104,238,0.2)',
            icon: <Zap size={14} />,
            msg: isDemo ? 'Auto-signing AVM transactions (demo)…' : 'Sign the AVM atomic group transaction in Lute…',
        },
        processing: {
            color: '#5a9a5a', bg: 'rgba(90,154,90,0.08)', border: 'rgba(90,154,90,0.2)',
            icon: <CheckCircle2 size={14} />,
            msg: 'Payment signed — submitting to GoPlausible facilitator…',
        },
        done: {
            color: '#5a9a5a', bg: 'rgba(90,154,90,0.08)', border: 'rgba(90,154,90,0.2)',
            icon: <CheckCircle2 size={14} />,
            msg: 'Settlement confirmed.',
        },
    };

    const cfg = configs[phase];

    return (
        <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '12px 16px', borderRadius: 12,
                background: cfg.bg, border: `1px solid ${cfg.border}`,
                marginBottom: 16,
            }}
        >
            <span style={{ color: cfg.color, marginTop: 1 }}>{cfg.icon}</span>
            <div style={{ flex: 1 }}>
                <span style={{ fontSize: 12, color: cfg.color, fontFamily: 'Inter', fontWeight: 600 }}>
                    {cfg.msg}
                </span>
                {address && (
                    <div style={{ fontSize: 10, color: '#555', fontFamily: 'monospace', marginTop: 3 }}>
                        {isDemo ? 'Demo wallet' : 'Lute'} · {address.slice(0, 8)}…{address.slice(-6)}
                    </div>
                )}
            </div>
            {(phase === 'connecting' || phase === 'signing') && !isDemo && (
                <button
                    onClick={onBypass}
                    style={{
                        fontSize: 10, color: '#7b68ee', fontFamily: 'Inter', fontWeight: 600,
                        background: 'rgba(123,104,238,0.1)', border: '1px solid rgba(123,104,238,0.25)',
                        borderRadius: 6, padding: '4px 10px', cursor: 'pointer', whiteSpace: 'nowrap',
                    }}
                >
                    Auto-Sign
                </button>
            )}
        </motion.div>
    );
}

// ── Inner Component ────────────────────────────────────────────────────────────
function PaymentProcessingInner() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { activeAccount, signTransactions, wallets } = useWallet();

    const { policyLimits, spendToday, usedNonces, addReceipt, addTrace, addPendingApproval } = usePaymentContext();
    const { providers: allProviders } = useProviderContext();

    const providerId = searchParams.get('providerId');
    // Read demo flag forwarded from checkout page
    const demoFromUrl = searchParams.get('demo') === '1';

    const api = apis.find(a => a.id === providerId) || apis[0];

    const [activePaymentId, setActivePaymentId] = useState<string | null>(null);
    const [walletPhase, setWalletPhase] = useState<WalletPhase>('init');
    const [isDemo, setIsDemo] = useState(demoFromUrl);
    const [walletAddress, setWalletAddress] = useState<string | null>(null);

    // Refs that stay fresh inside async closures
    const activeAccountRef = useRef<any>(activeAccount);
    const signTransactionsRef = useRef<any>(signTransactions);
    const bypassResolverRef = useRef<((val: boolean) => void) | null>(null);
    const isBypassedRef = useRef(demoFromUrl);

    useEffect(() => {
        activeAccountRef.current = activeAccount;
        if (activeAccount?.address) setWalletAddress(activeAccount.address);
    }, [activeAccount]);

    useEffect(() => {
        signTransactionsRef.current = signTransactions;
    }, [signTransactions]);

    // Auto-sign bypass handler
    const handleBypass = useCallback(() => {
        isBypassedRef.current = true;
        setIsDemo(true);
        if (bypassResolverRef.current) {
            bypassResolverRef.current(true);
            bypassResolverRef.current = null;
        }
    }, []);

    // ── Ensure wallet is ready (tries Lute first, then falls back to demo) ──
    const ensureWallet = useCallback(async (): Promise<{ account: any; signTxns: any; demo: boolean }> => {
        // Already bypassed from checkout page
        if (isBypassedRef.current) {
            const demoAddr = activeAccountRef.current?.address ?? '36UMZNGBAZMINJH7266YYGHTR2OLEHTFRREB6ROQI3XA54EQXXCLTZTMG4';
            setWalletAddress(demoAddr);
            return {
                account: activeAccountRef.current ?? { address: demoAddr },
                signTxns: async (txns: Uint8Array[]) => txns.map(() => new Uint8Array([1, 2, 3, 4])),
                demo: true,
            };
        }

        // Already connected from Navbar/checkout
        if (activeAccountRef.current?.address && typeof signTransactionsRef.current === 'function') {
            setWalletAddress(activeAccountRef.current.address);
            setIsDemo(false);
            return {
                account: activeAccountRef.current,
                signTxns: signTransactionsRef.current,
                demo: false,
            };
        }

        // Try to connect Lute
        const luteWallet = wallets?.find(w => w.id === WalletId.LUTE);
        if (luteWallet) {
            setWalletPhase('connecting');
            try {
                if (!luteWallet.isConnected) {
                    await luteWallet.connect();
                }

                // Wait up to 3s for activeAccount to populate
                let waited = 0;
                while (!activeAccountRef.current?.address && waited < 3000) {
                    await new Promise(r => setTimeout(r, 200));
                    waited += 200;
                    // Bail out early if user clicked bypass during wait
                    if (isBypassedRef.current) break;
                }

                if (activeAccountRef.current?.address && !isBypassedRef.current) {
                    const freshSign = (luteWallet as any).signTransactions?.bind(luteWallet)
                        ?? signTransactionsRef.current;

                    setWalletAddress(activeAccountRef.current.address);
                    setIsDemo(false);

                    // Wrap with bypass race for signing step
                    const signWithBypass = async (txns: Uint8Array[], indexesToSign?: number[]) => {
                        if (isBypassedRef.current) {
                            return txns.map(() => new Uint8Array([1, 2, 3, 4]));
                        }
                        return Promise.race([
                            freshSign ? freshSign(txns, indexesToSign) : Promise.reject(new Error('No signer')),
                            new Promise<Uint8Array[]>(resolve => {
                                bypassResolverRef.current = () => {
                                    resolve(txns.map(() => new Uint8Array([1, 2, 3, 4])));
                                };
                            }),
                        ]);
                    };

                    return {
                        account: activeAccountRef.current,
                        signTxns: signWithBypass,
                        demo: false,
                    };
                }
            } catch (err: any) {
                const msg = err?.message ?? String(err);
                if (!msg.includes('Could not establish connection') && !msg.includes('Receiving end')) {
                    console.warn('[Processing] Lute connect error:', msg);
                }
            }
        }

        // Fallback: demo mode
        const demoAddr = '36UMZNGBAZMINJH7266YYGHTR2OLEHTFRREB6ROQI3XA54EQXXCLTZTMG4';
        setWalletAddress(demoAddr);
        setIsDemo(true);
        isBypassedRef.current = true;
        return {
            account: { address: demoAddr },
            signTxns: async (txns: Uint8Array[]) => txns.map(() => new Uint8Array([1, 2, 3, 4])),
            demo: true,
        };
    }, [wallets]);

    const apiToProvider = useCallback((apiItem: any): Provider => {
        const numPrice = parseFloat(apiItem.price.replace(/[^0-9.]/g, '')) || 0.05;
        const isUpto = apiItem.model?.toLowerCase().includes('cap') || apiItem.model?.toLowerCase().includes('upto');
        return {
            id: apiItem.id,
            name: apiItem.name,
            description: apiItem.desc || apiItem.rawDescription || 'Enterprise API Provider',
            category: (apiItem.cat as any) || 'LLM & NLP',
            price: numPrice,
            paymentType: isUpto ? 'upto' : 'exact',
            qualityScore: apiItem.qualityScore || 90,
            payToAddress: '36UMZNGBAZMINJH7266YYGHTR2OLEHTFRREB6ROQI3XA54EQXXCLTZTMG4',
            network: ALGORAND_TESTNET_CAIP2,
            endpoint: apiItem.endpoint || `/api/providers/${apiItem.id}`,
            outputSchema: { status: 'string', result: 'object' },
            active: true,
        };
    }, []);

    const executePaymentFlow = useCallback(async () => {
        const currentProvider = apiToProvider(api);

        const defaultPayloads: Record<string, unknown> = {
            'p-llama3-sentiment': { prompt: 'Analyze financial sentiment for Algorand ecosystem.' },
            'p-vision-inspector': { imageUrl: 'https://example.com/chart.png', prompt: 'Extract labels' },
        };
        const parsedInput = defaultPayloads[currentProvider.id]
            || { prompt: `Inference request for ${currentProvider.name}` };

        // ── Step 1: Get wallet ─────────────────────────────────────────────────
        const { account, signTxns, demo } = await ensureWallet();
        setWalletPhase('signing');

        console.log('[X402 DEBUG] HOP 1 wallet', {
            connected: !!account,
            walletAddress: account?.address ?? null,
            network: ALGORAND_TESTNET_CAIP2,
            chain: 'Algorand TestNet',
            hasSigner: typeof signTxns === 'function',
            isDemo: demo,
        });

        console.log('[X402 DEBUG] HOP 2 request', {
            URL: currentProvider.endpoint,
            method: 'POST',
            providerId: currentProvider.id,
            price: currentProvider.price,
        });

        setWalletPhase('processing');

        try {
            const response = await requestPaidResource(
                currentProvider,
                parsedInput,
                policyLimits,
                spendToday,
                usedNonces,
                {
                    activeAccount: account,
                    signTransactions: signTxns,
                    allProviders,
                    isBypass: demo,
                    onPaymentIdAssigned: (id: string) => {
                        setActivePaymentId(id);
                    },
                }
            );

            if (response.trace) {
                addTrace(response.trace);
            }

            setWalletPhase('done');

            if ('error' in response && response.error) {
                if (response.requiresApproval) {
                    addPendingApproval({
                        providerId: currentProvider.id,
                        providerName: currentProvider.name,
                        estimatedCost: currentProvider.price,
                        reason: response.error,
                        requestInput: parsedInput,
                    });
                }
                router.push(`/payment/error?error=${encodeURIComponent(response.error)}&providerId=${currentProvider.id}`);
            } else if ('receipt' in response && response.receipt && response.receipt.settlement?.settled && response.receipt.settlement?.settlementId) {
                addReceipt(response.receipt);

                if (typeof window !== 'undefined' && (response as any).result) {
                    sessionStorage.setItem(`result-${response.receipt.id}`, JSON.stringify((response as any).result));
                }

                router.push(`/payment/success?receiptId=${response.receipt.id}&providerId=${currentProvider.id}`);
            } else {
                const errText = ('error' in response && response.error) || 'On-chain settlement failed: No confirmed Algorand transaction ID returned.';
                router.push(`/payment/error?error=${encodeURIComponent(errText)}&providerId=${currentProvider.id}`);
            }
        } catch (err: any) {
            router.push(`/payment/error?error=${encodeURIComponent(err.message || 'Execution error')}&providerId=${currentProvider.id}`);
        }
    }, [api, apiToProvider, policyLimits, spendToday, usedNonces, allProviders, addTrace, addReceipt, addPendingApproval, router, ensureWallet]);

    const hasExecutedRef = useRef(false);

    useEffect(() => {
        if (api && !hasExecutedRef.current) {
            hasExecutedRef.current = true;
            executePaymentFlow();
        }
    }, [api, executePaymentFlow]);

    return (
        <div style={{ background: '#050505', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 100, paddingBottom: 100 }}>
                <div style={{ maxWidth: 640, width: '100%', padding: '0 24px' }}>
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                        <h2 style={{ fontFamily: 'Inter', fontSize: 20, fontWeight: 700, color: '#f0f0f0', marginBottom: 6 }}>
                            x402 Protocol Live Settlement
                        </h2>
                        <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#888' }}>
                            {isDemo
                                ? 'Running in demo mode — transactions auto-signed for demonstration'
                                : 'Lute wallet connected — awaiting on-chain signature'}
                        </p>
                    </div>

                    {/* Live wallet status banner */}
                    <WalletStatusBanner
                        phase={walletPhase}
                        address={walletAddress}
                        isDemo={isDemo}
                        onBypass={handleBypass}
                    />

                    {activePaymentId ? (
                        <LiveProvenanceStepper paymentId={activePaymentId} />
                    ) : (
                        <div style={{
                            padding: 40, background: 'rgba(12,12,14,0.9)',
                            borderRadius: 24, border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center',
                        }}>
                            <Loader2 style={{ width: 32, height: 32, color: '#6366f1', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
                            <p style={{ fontFamily: 'Inter', fontSize: 14, color: '#aaa', marginBottom: 16 }}>
                                {walletPhase === 'init' && 'Initialising…'}
                                {walletPhase === 'connecting' && 'Connecting to Lute wallet…'}
                                {walletPhase === 'signing' && (isDemo ? 'Auto-signing…' : 'Waiting for Lute signature…')}
                                {walletPhase === 'processing' && 'Submitting payment to facilitator…'}
                            </p>

                            {/* Show bypass button if stuck waiting for Lute */}
                            <AnimatePresence>
                                {(walletPhase === 'connecting' || walletPhase === 'signing') && !isDemo && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <p style={{ fontSize: 11, color: '#555', fontFamily: 'Inter', marginBottom: 10 }}>
                                            Lute not responding? Switch to demo mode:
                                        </p>
                                        <button
                                            onClick={handleBypass}
                                            style={{
                                                padding: '8px 18px', borderRadius: 10,
                                                background: 'rgba(123,104,238,0.1)',
                                                border: '1px solid rgba(123,104,238,0.3)',
                                                color: '#7b68ee', fontFamily: 'Inter', fontSize: 12, fontWeight: 600,
                                                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
                                            }}
                                        >
                                            <Zap size={12} /> Auto-Sign (Demo)
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

export default function PaymentProcessingPage() {
    return (
        <Suspense fallback={
            <div style={{ background: '#050505', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#666' }}>Loading Secure Transaction...</p>
            </div>
        }>
            <PaymentProcessingInner />
        </Suspense>
    );
}
