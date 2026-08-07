'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, Zap, CheckCircle2, ShieldAlert } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { usePaymentContext } from '@/context/PaymentContext';
import { useProviderContext } from '@/context/ProviderContext';
import { requestPaidResource } from '@/lib/x402/client';
import { apis } from '@/lib/data/marketplaceApis';
import { useWallet } from '@txnlab/use-wallet-react';
import { ALGORAND_TESTNET_CAIP2 } from '@x402-avm/avm';
import type { Provider } from '@/lib/x402/types';

// ─── Steps Array ──────────────────────────────────────────

const PROCESSING_STEPS = [
    "Preparing Payment Session",
    "Reading x402 Requirements (HTTP 402)",
    "Waiting For Wallet Confirmation",
    "Signing Transaction",
    "Verifying Payload with Facilitator",
    "Retrying Request with Authorization",
    "Executing Provider API Node",
    "Generating Immutable Receipt"
];

// ─── Inner Component ──────────────────────────────────────

function PaymentProcessingInner() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { activeAccount, signTransactions } = useWallet();

    const { policyLimits, spendToday, usedNonces, addReceipt, addTrace, addPendingApproval } = usePaymentContext();
    const { providers: allProviders } = useProviderContext();

    const providerId = searchParams.get('providerId');
    const api = apis.find(a => a.id === providerId) || apis[0];

    const [stepIndex, setStepIndex] = useState(0);

    const apiToProvider = useCallback((apiItem: any): Provider => {
        const numPrice = parseFloat(apiItem.price.replace(/[^0-9.]/g, '')) || 0.05;
        const isUpto = apiItem.model?.toLowerCase().includes('cap') || apiItem.model?.toLowerCase().includes('upto');
        return {
            id: apiItem.id,
            name: apiItem.name,
            description: apiItem.desc || apiItem.rawDescription || "Enterprise API Provider",
            category: (apiItem.cat as any) || "LLM & NLP",
            price: numPrice,
            paymentType: isUpto ? "upto" : "exact",
            qualityScore: apiItem.qualityScore || 90,
            payToAddress: process.env.RESOURCE_PAY_TO || 'GQHCRMG3DSGF6OWFQ6W6MT5CDV5IZTNEVHFYKNB42EI4VDOINC6AZSYB74',
            network: ALGORAND_TESTNET_CAIP2,
            endpoint: apiItem.endpoint || `/api/providers/${apiItem.id}`,
            outputSchema: { status: "string", result: "object" },
            active: true,
        };
    }, []);

    const executePaymentFlow = useCallback(async () => {
        const currentProvider = apiToProvider(api);

        // Pre-configured default task payload depending on provider category
        const defaultPayloads: Record<string, unknown> = {
            "gpt4-vision": { imageUrl: "https://example.com/invoice.png", prompt: "Extract invoice details" },
            "whisper-stt": { audio_base64: "dGVzdC1hdWRpbw==", language: "english" },
            "datastream-ml": { stream_id: "nexus-stream-1", events: [{ count: 12 }] },
            "code-llama": { code_context: "function add(a, b) {}", instruction: "add unit tests" },
        };
        const parsedInput = defaultPayloads[currentProvider.id] || { prompt: `Inference request for ${currentProvider.name}` };

        // Drive step-by-step progress index increments
        const stepInterval = setInterval(() => {
            setStepIndex(prev => (prev < PROCESSING_STEPS.length - 1 ? prev + 1 : prev));
        }, 400);

        try {
            const response = await requestPaidResource(
                currentProvider,
                parsedInput,
                policyLimits,
                spendToday,
                usedNonces,
                { activeAccount, signTransactions, allProviders }
            );

            clearInterval(stepInterval);

            // Add trace if output is present
            if (response.trace) {
                addTrace(response.trace);
            }

            if ("error" in response && response.error) {
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
            } else if ("receipt" in response && response.receipt && response.receipt.settlement?.settled && response.receipt.settlement?.settlementId) {
                addReceipt(response.receipt);
                
                // Store result preview temporarily or pass via storage
                if (typeof window !== 'undefined' && (response as any).result) {
                    sessionStorage.setItem(`result-${response.receipt.id}`, JSON.stringify((response as any).result));
                }

                router.push(`/payment/success?receiptId=${response.receipt.id}&providerId=${currentProvider.id}`);
            } else {
                const errText = ("error" in response && response.error) || "On-chain settlement failed: No confirmed Algorand transaction ID returned.";
                router.push(`/payment/error?error=${encodeURIComponent(errText)}&providerId=${currentProvider.id}`);
            }
        } catch (err: any) {
            clearInterval(stepInterval);
            router.push(`/payment/error?error=${encodeURIComponent(err.message || 'Execution error')}&providerId=${currentProvider.id}`);
        }
    }, [api, apiToProvider, policyLimits, spendToday, usedNonces, allProviders, addTrace, addReceipt, addPendingApproval, router]);

    const hasExecutedRef = React.useRef(false);

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
                <div style={{ maxWidth: 540, width: '105%', padding: '40px 32px', borderRadius: 24, background: 'rgba(12,12,14,0.9)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 24px 60px rgba(0,0,0,0.6)', textAlign: 'center' }}>
                    
                    {/* Centered Loader Animation */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginBottom: 32 }}>
                        <div style={{ position: 'relative', width: 64, height: 64 }}>
                            <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: '4px solid rgba(255,255,255,0.05)', borderTopColor: '#5a9a5a', animation: 'spin 1s linear infinite' }} />
                            <Zap size={22} color="#5a9a5a" style={{ position: 'absolute', top: 21, left: 21, animation: 'pulse 1.5s ease-in-out infinite' }} />
                        </div>
                        <div>
                            <h3 style={{ fontFamily: 'Inter', fontSize: 16, fontWeight: 700, color: '#efefef', margin: '8px 0 2px' }}>
                                Executing x402 Protocol
                            </h3>
                            <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#666' }}>
                                Please sign transaction authorization in your wallet
                            </p>
                        </div>
                    </div>

                    {/* Animated steps timeline */}
                    <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 16, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left' }}>
                        {PROCESSING_STEPS.map((step, idx) => {
                            const isDone = idx < stepIndex;
                            const isActive = idx === stepIndex;
                            return (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, fontFamily: 'monospace' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        {isDone ? (
                                            <CheckCircle2 size={13} color="#5a9a5a" />
                                        ) : isActive ? (
                                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', display: 'inline-block', animation: 'ping 1s infinite' }} />
                                        ) : (
                                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#222', display: 'inline-block' }} />
                                        )}
                                        <span style={{ color: isActive ? '#3b82f6' : isDone ? '#555' : '#888', fontWeight: isActive ? 600 : 400 }}>
                                            {step}
                                        </span>
                                    </div>
                                    {isDone && <span style={{ color: '#5a9a5a', fontSize: 10 }}>Completed</span>}
                                    {isActive && <span style={{ color: '#3b82f6', fontSize: 10, animation: 'pulse 1s infinite' }}>Active</span>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>
            <Footer />
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(0.95); }
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
