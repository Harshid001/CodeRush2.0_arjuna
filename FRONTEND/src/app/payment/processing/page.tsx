'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, Zap, CheckCircle2, ShieldAlert } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LiveProvenanceStepper from '@/components/LiveProvenanceStepper';
import { usePaymentContext } from '@/context/PaymentContext';
import { useProviderContext } from '@/context/ProviderContext';
import { requestPaidResource } from '@/lib/x402/client';
import { apis } from '@/lib/data/marketplaceApis';
import { useWallet } from '@txnlab/use-wallet-react';
import { ALGORAND_TESTNET_CAIP2 } from '@x402-avm/avm';
import type { Provider } from '@/lib/x402/types';

function PaymentProcessingInner() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { activeAccount, signTransactions } = useWallet();

    const { policyLimits, spendToday, usedNonces, addReceipt, addTrace, addPendingApproval } = usePaymentContext();
    const { providers: allProviders } = useProviderContext();

    const providerId = searchParams.get('providerId');
    const api = apis.find(a => a.id === providerId) || apis[0];

    const [activePaymentId, setActivePaymentId] = useState<string | null>(null);

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
            payToAddress: process.env.RESOURCE_PAY_TO || '36UMZNGBAZMINJH7266YYGHTR2OLEHTFRREB6ROQI3XA54EQXXCLTZTMG4',
            network: ALGORAND_TESTNET_CAIP2,
            endpoint: apiItem.endpoint || `/api/providers/${apiItem.id}`,
            outputSchema: { status: "string", result: "object" },
            active: true,
        };
    }, []);

    const executePaymentFlow = useCallback(async () => {
        const currentProvider = apiToProvider(api);

        console.log("[X402 DEBUG] HOP 1 wallet", {
            connected: !!activeAccount,
            walletAddress: activeAccount?.address || null,
            network: ALGORAND_TESTNET_CAIP2,
            chain: "Algorand TestNet",
            hasSigner: typeof signTransactions === "function",
        });

        const defaultPayloads: Record<string, unknown> = {
            "p-llama3-sentiment": { prompt: "Analyze financial sentiment for Algorand ecosystem." },
            "p-vision-inspector": { imageUrl: "https://example.com/chart.png", prompt: "Extract labels" },
        };
        const parsedInput = defaultPayloads[currentProvider.id] || { prompt: `Inference request for ${currentProvider.name}` };

        console.log("[X402 DEBUG] HOP 2 request", {
            URL: currentProvider.endpoint,
            method: "POST",
            providerId: currentProvider.id,
            price: currentProvider.price,
        });

        const effectiveAccount = activeAccount || { address: '36UMZNGBAZMINJH7266YYGHTR2OLEHTFRREB6ROQI3XA54EQXXCLTZTMG4' };
        const effectiveSignTxns = typeof signTransactions === "function"
            ? signTransactions
            : async (txns: Uint8Array[]) => txns.map(() => new Uint8Array([1, 2, 3, 4]));
        const isDemoBypass = !activeAccount || typeof signTransactions !== "function";

        try {
            const response = await requestPaidResource(
                currentProvider,
                parsedInput,
                policyLimits,
                spendToday,
                usedNonces,
                {
                    activeAccount: effectiveAccount,
                    signTransactions: effectiveSignTxns,
                    allProviders,
                    isBypass: isDemoBypass,
                    onPaymentIdAssigned: (id: string) => {
                        setActivePaymentId(id);
                    },
                }
            );

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
                
                if (typeof window !== 'undefined' && (response as any).result) {
                    sessionStorage.setItem(`result-${response.receipt.id}`, JSON.stringify((response as any).result));
                }

                router.push(`/payment/success?receiptId=${response.receipt.id}&providerId=${currentProvider.id}`);
            } else {
                const errText = ("error" in response && response.error) || "On-chain settlement failed: No confirmed Algorand transaction ID returned.";
                router.push(`/payment/error?error=${encodeURIComponent(errText)}&providerId=${currentProvider.id}`);
            }
        } catch (err: any) {
            router.push(`/payment/error?error=${encodeURIComponent(err.message || 'Execution error')}&providerId=${currentProvider.id}`);
        }
    }, [api, apiToProvider, policyLimits, spendToday, usedNonces, allProviders, addTrace, addReceipt, addPendingApproval, router, activeAccount, signTransactions]);

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
                <div style={{ maxWidth: 640, width: '100%', padding: '0 24px' }}>
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                        <h2 style={{ fontFamily: 'Inter', fontSize: 20, fontWeight: 700, color: '#f0f0f0', marginBottom: 6 }}>
                            x402 Protocol Live Settlement
                        </h2>
                        <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#888' }}>
                            Persisted server provenance trail updating live during execution
                        </p>
                    </div>

                    {activePaymentId ? (
                        <LiveProvenanceStepper paymentId={activePaymentId} />
                    ) : (
                        <div style={{ padding: 40, background: 'rgba(12,12,14,0.9)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
                            <p style={{ fontFamily: 'Inter', fontSize: 14, color: '#aaa' }}>
                                Initiating payment negotiation & server challenge...
                            </p>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
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
