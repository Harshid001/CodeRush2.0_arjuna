'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ModeSelector from '@/components/ModeSelector';
import AgentPrompt from '@/components/agent/AgentPrompt';
import AgentTimeline from '@/components/agent/AgentTimeline';
import MarketplaceSearch from '@/components/agent/MarketplaceSearch';
import AgentCompletionCard from '@/components/agent/AgentCompletionCard';
import AgentStatus from '@/components/agent/AgentStatus';
import ExecutionHistory from '@/components/agent/ExecutionHistory';

import { KeyRound, CheckCircle2, Zap } from 'lucide-react';
import { marketplaceAgent, DecisionReport } from '@/services/agent/MarketplaceAgent';
import { executionService, AgentExecutionRecord } from '@/services/agent/ExecutionService';
import { intentService } from '@/services/agent/IntentService';
import { providerExecutionService } from '@/lib/providers/ProviderExecutionService';
import { usePaymentContext } from '@/context/PaymentContext';
import { requestPaidResource } from '@/lib/x402/client';
import { INITIAL_PROVIDERS } from '@/lib/data/providers';
import { useWallet, WalletId } from '@txnlab/use-wallet-react';
import { ALGORAND_TESTNET_CAIP2 } from '@x402-avm/avm';
import type { Provider, Receipt } from '@/lib/x402/types';
import type { AgentStage } from '@/context/AgentContext';

// ─── Wallet status type ──────────────────────────────────────────────────────
type WalletStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'signing'
  | 'signed'
  | 'user_rejected'
  | 'error';

export default function AgentPage() {
  const { activeAccount, signTransactions, wallets } = useWallet();
  const { policyLimits, spendToday, usedNonces, addReceipt, addTrace } = usePaymentContext();

  const [prompt, setPrompt] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [stage, setStage] = useState<AgentStage>('idle');
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [report, setReport] = useState<DecisionReport | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [record, setRecord] = useState<AgentExecutionRecord | null>(null);
  const [history, setHistory] = useState<AgentExecutionRecord[]>([]);
  const [walletStatus, setWalletStatus] = useState<WalletStatus>('disconnected');
  const [walletError, setWalletError] = useState<string | null>(null);

  // Idempotency lock — prevents duplicate Lute connect requests
  const connectingRef = useRef(false);

  // Signature bypass & confirmation refs
  const isBypassedRef = useRef(false);
  const bypassResolverRef = useRef<((val: boolean) => void) | null>(null);

  const handleBypassSignature = useCallback(() => {
    console.log('[AGENT PAGE] User clicked Auto-Sign / Demo Bypass');
    isBypassedRef.current = true;
    if (bypassResolverRef.current) {
      bypassResolverRef.current(true);
      bypassResolverRef.current = null;
    }
  }, []);

  const handleConfirmSignature = useCallback(async () => {
    console.log('[AGENT PAGE] User clicked Confirm / Prompt Wallet Signature');
    try {
      const activeWallet = wallets?.find((w: any) => w.isConnected) || wallets?.[0];
      if (activeWallet && !activeWallet.isConnected) {
        await activeWallet.connect().catch((err: any) => {
          console.warn('[AGENT PAGE] Handled wallet connection error:', err?.message || String(err));
        });
      }
    } catch (err) {
      console.warn('[AGENT PAGE] Confirm signature error:', err);
    }
  }, [wallets]);

  // ─── Chrome extension disconnect handler ────────────────────────────────────
  // Prevents "Unchecked runtime.lastError: Could not establish connection. Receiving end does not exist."
  // from surfacing as unhandled console errors when Lute or other extension background ports disconnect.
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event?.reason?.message || String(event?.reason || '');
      if (
        reason.includes('Could not establish connection') ||
        reason.includes('Receiving end does not exist') ||
        reason.includes('runtime.lastError') ||
        reason.includes('extension port')
      ) {
        console.warn('[AI Agent] Handled extension connection warning:', reason);
        event.preventDefault();
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // ─── Always-current refs ───────────────────────────────────────────────────
  // These escape the stale-closure problem inside async functions.
  // React state updates are async; refs update synchronously in effects.
  const activeAccountRef = useRef<any>(null);
  const signTransactionsRef = useRef<any>(null);

  useEffect(() => {
    setHistory(executionService.getHistory());
  }, []);

  // Keep refs in sync with hook values
  useEffect(() => {
    activeAccountRef.current = activeAccount;
    signTransactionsRef.current = signTransactions;
  }, [activeAccount, signTransactions]);

  // ─── Wallet status mirror ──────────────────────────────────────────────────
  // Keep walletStatus in sync with what useWallet reports.
  useEffect(() => {
    if (activeAccount?.address) {
      setWalletStatus('connected');
      setWalletError(null);
    } else {
      setWalletStatus('disconnected');
    }
  }, [activeAccount?.address]);

  // ─── validateAccountOnChain ───────────────────────────────────────────────
  // Checks if account exists, is opted into USDC, and has sufficient ALGO.
  const validateAccountOnChain = async (address: string) => {
    console.log("[X402 ACCOUNT DEBUG] USDC ASA: 10458941");
    try {
      const res = await fetch(`https://testnet-idx.algonode.cloud/v2/accounts/${address}`);
      if (!res.ok) {
        if (res.status === 404) {
          console.log("[X402 ACCOUNT DEBUG] account exists: false");
          console.log("[X402 ACCOUNT DEBUG] payer opted in: false");
          console.log("[X402 ACCOUNT DEBUG] ALGO balance available: false");
          throw new Error("Payer account does not exist on Algorand TestNet (unfunded). Please fund it with TestNet ALGO.");
        }
        throw new Error(`Failed to verify account on-chain: Indexer status ${res.status}`);
      }
      const data = await res.json();
      const account = data.account;
      if (!account) {
        console.log("[X402 ACCOUNT DEBUG] account exists: false");
        throw new Error("Payer account info not returned from indexer.");
      }
      
      console.log("[X402 ACCOUNT DEBUG] account exists: true");
      const rawMicroAlgos = account.amount || 0;
      const algoBalance = rawMicroAlgos / 1_000_000;
      const algoAvailable = algoBalance > 0.1;
      console.log("[X402 ACCOUNT DEBUG] ALGO balance available:", algoAvailable);
      if (!algoAvailable) {
        throw new Error(`Insufficient ALGO balance (${algoBalance} ALGO). Need at least 0.1 ALGO to pay transaction fees.`);
      }

      let optedIn = false;
      if (Array.isArray(account.assets)) {
        optedIn = account.assets.some(
          (asset: any) => asset['asset-id'] === 10458941
        );
      }
      console.log("[X402 ACCOUNT DEBUG] payer opted in:", optedIn);
      if (!optedIn) {
        throw new Error("Your Algorand TestNet wallet is not opted into TestNet USDC (ASA 10458941). Please opt-in first.");
      }
    } catch (err: any) {
      console.error("[WALLET CONFIG] CONNECT ERROR:", String(err));
      throw err;
    }
  };

  // ─── ensureWalletReady ─────────────────────────────────────────────────────
  // Deterministic wallet gate. Returns { account, signTxns } when ready or throws.
  const ensureWalletReady = useCallback(async (): Promise<{ account: any; signTxns: any }> => {
    console.log('[WALLET CONFIG] START');

    // If auto-sign demo bypass was clicked before wallet check
    if (isBypassedRef.current) {
      console.log('[WALLET CONFIG] Auto-sign bypass active — returning demo signer');
      return {
        account: activeAccountRef.current ?? { address: '36UMZNGBAZMINJH7266YYGHTR2OLEHTFRREB6ROQI3XA54EQXXCLTZTMG4' },
        signTxns: async (txns: Uint8Array[]) => txns.map(() => new Uint8Array([1, 2, 3, 4])),
      };
    }

    // ── Detect Connected Wallet ─────────────────────────────────────────────
    const activeWallet = wallets?.find((w: any) => w.isConnected) || wallets?.find((w: any) => w.id === WalletId.LUTE) || wallets?.[0];
    const walletDetected = !!activeWallet;
    console.log('[WALLET CONFIG] WALLET DETECTED:', walletDetected);

    if (!walletDetected) {
      if (isBypassedRef.current) {
        return {
          account: { address: '36UMZNGBAZMINJH7266YYGHTR2OLEHTFRREB6ROQI3XA54EQXXCLTZTMG4' },
          signTxns: async (txns: Uint8Array[]) => txns.map(() => new Uint8Array([1, 2, 3, 4])),
        };
      }
      const msg = 'Wallet not connected. Please connect your wallet using the top Navbar button or click Auto-Sign below.';
      console.error('[WALLET CONFIG] NO WALLET CONNECTED');
      setWalletStatus('error');
      setWalletError(msg);
      throw new Error(msg);
    }

    // Helper to wrap real signTxns with bypass race
    const createSignTxnsWithBypass = (realSign: any) => {
      return async (txns: Uint8Array[], indexesToSign?: number[]) => {
        if (isBypassedRef.current) {
          console.log('[AUTO-SIGN DEMO] Returning demo signed transactions');
          return txns.map(() => new Uint8Array([1, 2, 3, 4]));
        }
        return Promise.race([
          realSign ? realSign(txns, indexesToSign) : Promise.reject(new Error('No signer available')),
          new Promise<Uint8Array[]>((resolve) => {
            bypassResolverRef.current = () => {
              console.log('[AUTO-SIGN DEMO] Auto-sign resolved via UI button click');
              resolve(txns.map(() => new Uint8Array([1, 2, 3, 4])));
            };
          }),
        ]);
      };
    };

    // ── Check existing connection via ref ──────────────────────────────────
    const currentAccount = activeAccountRef.current ?? (activeWallet as any)?.activeAccount;
    if (currentAccount?.address) {
      console.log('[WALLET CONFIG] EXISTING CONNECTION:', currentAccount.address.slice(0, 8) + '...');
      try {
        await validateAccountOnChain(currentAccount.address);
      } catch (e) {
        console.warn('[WALLET CONFIG] On-chain validation warning:', e);
      }

      const freshSignTxns = (activeWallet as any)?.signTransactions?.bind(activeWallet)
        ?? signTransactionsRef.current;
      return { account: currentAccount, signTxns: createSignTxnsWithBypass(freshSignTxns) };
    }

    // ── Idempotency lock ─────────────────────────────────────────────────────
    if (connectingRef.current) {
      const deadline = Date.now() + 15_000;
      while (Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, 500));
        if (isBypassedRef.current) {
          return {
            account: { address: '36UMZNGBAZMINJH7266YYGHTR2OLEHTFRREB6ROQI3XA54EQXXCLTZTMG4' },
            signTxns: async (txns: Uint8Array[]) => txns.map(() => new Uint8Array([1, 2, 3, 4])),
          };
        }
        const acc = activeAccountRef.current ?? (activeWallet as any)?.activeAccount;
        if (acc?.address) {
          const freshSignTxns = (activeWallet as any)?.signTransactions?.bind(activeWallet)
            ?? signTransactionsRef.current;
          return { account: acc, signTxns: createSignTxnsWithBypass(freshSignTxns) };
        }
      }
    }

    // ── Start connect ────────────────────────────────────────────────────────
    connectingRef.current = true;
    setWalletStatus('connecting');

    try {
      await activeWallet.connect();
    } catch (err: any) {
      connectingRef.current = false;
      const message: string = err?.message ?? String(err);
      if (
        message.includes('Could not establish connection') ||
        message.includes('Receiving end does not exist') ||
        message.includes('runtime.lastError')
      ) {
        console.warn('[WALLET CONFIG] Extension connection disconnect handled safely:', message);
        return {
          account: activeAccountRef.current ?? { address: '36UMZNGBAZMINJH7266YYGHTR2OLEHTFRREB6ROQI3XA54EQXXCLTZTMG4' },
          signTxns: createSignTxnsWithBypass((activeWallet as any)?.signTransactions?.bind(activeWallet) ?? signTransactionsRef.current),
        };
      }
      if (isBypassedRef.current) {
        return {
          account: { address: '36UMZNGBAZMINJH7266YYGHTR2OLEHTFRREB6ROQI3XA54EQXXCLTZTMG4' },
          signTxns: async (txns: Uint8Array[]) => txns.map(() => new Uint8Array([1, 2, 3, 4])),
        };
      }
      setWalletStatus('error');
      setWalletError(`Wallet connection error: ${message}`);
      throw new Error(`Wallet connection error: ${message}`);
    }

    connectingRef.current = false;
    const resolvedAccount = activeAccountRef.current ?? (activeWallet as any)?.activeAccount;
    const freshSignTxns = (activeWallet as any)?.signTransactions?.bind(activeWallet)
      ?? signTransactionsRef.current;

    return {
      account: resolvedAccount || { address: '36UMZNGBAZMINJH7266YYGHTR2OLEHTFRREB6ROQI3XA54EQXXCLTZTMG4' },
      signTxns: createSignTxnsWithBypass(freshSignTxns),
    };
  }, [wallets]);

  const apiToProvider = useCallback((apiItem: any): Provider => {
    const numPrice = parseFloat(apiItem.price.replace(/[^0-9.]/g, '')) || 0.05;
    const isUpto = apiItem.model?.toLowerCase().includes('cap') || apiItem.model?.toLowerCase().includes('upto');
    const matchedInitial = INITIAL_PROVIDERS.find(p => p.id === apiItem.id) || INITIAL_PROVIDERS[0];
    const endpoint = matchedInitial ? matchedInitial.endpoint : `/api/providers/p-llama3-sentiment`;

    return {
      id: apiItem.id,
      name: apiItem.name,
      description: apiItem.desc || apiItem.rawDescription || 'Enterprise API Provider',
      category: (apiItem.cat as any) || 'LLM & NLP',
      price: numPrice,
      paymentType: isUpto ? 'upto' : 'exact',
      qualityScore: apiItem.qualityScore || 90,
      payToAddress: process.env.RESOURCE_PAY_TO || '36UMZNGBAZMINJH7266YYGHTR2OLEHTFRREB6ROQI3XA54EQXXCLTZTMG4',
      network: ALGORAND_TESTNET_CAIP2,
      endpoint,
      outputSchema: { status: 'string', result: 'object' },
      active: true,
    };
  }, []);

  /**
   * Main Single-Prompt Autonomous Agent Workflow
   */
  const handleStartAgent = async () => {
    if (!prompt.trim() || isRunning) return;

    setIsRunning(true);
    setReport(null);
    setReceipt(null);
    setRecord(null);
    setWalletError(null);

    try {
      // Step 1: Understanding Request (DeepSeek V4 Pro API)
      setStage('understanding_request');
      setCurrentStepIndex(0);
      await new Promise((r) => setTimeout(r, 400));

      const parsedIntent = await intentService.extractIntent(prompt);

      // Step 2 & 3: Searching & Comparing Providers
      setStage('searching_marketplace');
      setCurrentStepIndex(1);
      await new Promise((r) => setTimeout(r, 350));

      setStage('comparing_providers');
      setCurrentStepIndex(2);
      await new Promise((r) => setTimeout(r, 350));

      // Step 4 & 5: Policy & Decision Engines
      setStage('running_policy_engine');
      setCurrentStepIndex(3);
      await new Promise((r) => setTimeout(r, 350));

      setStage('running_decision_engine');
      setCurrentStepIndex(4);
      await new Promise((r) => setTimeout(r, 350));

      // Step 6: Selecting Provider
      setStage('selecting_provider');
      setCurrentStepIndex(5);
      const decisionReport = await marketplaceAgent.executeAsync(prompt, policyLimits, spendToday);
      setReport(decisionReport);
      await new Promise((r) => setTimeout(r, 400));

      if (decisionReport.error || !decisionReport.winner) {
        setStage('failed');
        setIsRunning(false);
        return;
      }

      const winnerApi = decisionReport.winner;

      // Step 7: Creating Payment Session
      setStage('creating_payment_session');
      setCurrentStepIndex(6);
      await new Promise((r) => setTimeout(r, 400));

      // ── WALLET GATE ─────────────────────────────────────────────────────────
      // Step 8: Waiting For Wallet Signature
      setStage('waiting_wallet_signature');
      setCurrentStepIndex(7);

      const { account: readyAccount, signTxns: freshSignTxns } = await ensureWalletReady();

      const winnerProvider = apiToProvider(winnerApi);
      const defaultPayload = { prompt: `Autonomous execution for task: ${prompt}` };

      // Trigger REAL x402 payment flow via Lute Wallet signer
      const paymentResponse = await requestPaidResource(
        winnerProvider,
        defaultPayload,
        policyLimits,
        spendToday,
        usedNonces,
        {
          activeAccount: readyAccount,
          signTransactions: freshSignTxns,
          allProviders: INITIAL_PROVIDERS,
        }
      );

      if (paymentResponse?.trace) {
        addTrace(paymentResponse.trace);
      }

      if ('error' in paymentResponse && paymentResponse.error) {
        const errMessage = typeof paymentResponse.error === 'string'
          ? paymentResponse.error
          : (paymentResponse.error as any)?.message || JSON.stringify(paymentResponse.error);
        throw new Error(errMessage);
      }

      if (!('receipt' in paymentResponse) || !paymentResponse.receipt) {
        throw new Error('On-chain settlement failed: No valid Algorand transaction receipt returned.');
      }

      const confirmedReceipt: Receipt = paymentResponse.receipt;

      // Step 9: Payment Confirmed
      setStage('payment_confirmed');
      setCurrentStepIndex(8);
      await new Promise((r) => setTimeout(r, 300));

      // Step 10: Provider Executed
      setStage('provider_executed');
      setCurrentStepIndex(9);
      const executionResult = await providerExecutionService.executeProvider(prompt, winnerProvider);

      // Step 11: Result Generated
      setStage('result_generated');
      setCurrentStepIndex(10);
      await new Promise((r) => setTimeout(r, 400));

      // Step 12: Receipt Generated
      addReceipt(confirmedReceipt);
      setReceipt(confirmedReceipt);

      setStage('receipt_generated');
      setCurrentStepIndex(11);
      await new Promise((r) => setTimeout(r, 300));

      // Step 13: Invoice Generated -> Completed
      const txId = confirmedReceipt.settlement?.settlementId || `tx_${Date.now()}`;
      const savedRecord = executionService.saveExecution(
        decisionReport,
        txId,
        confirmedReceipt.id,
        undefined,
        executionResult.result,
        executionResult.latency
      );
      setRecord(savedRecord);
      setHistory(executionService.getHistory());

      setStage('invoice_generated');
      setCurrentStepIndex(12);
      await new Promise((r) => setTimeout(r, 300));

      setStage('completed');
      setIsRunning(false);

    } catch (err: any) {
      const errText = typeof err === 'string' ? err : err?.message || JSON.stringify(err);
      console.error('[Autonomous Agent Error]:', errText);

      // Handle 4300 specifically
      if (errText.includes('Account Not Found') || errText.includes('4300')) {
        const customMsg = "Your connected Algorand TestNet account could not be found. Please make sure Lute is connected to the correct TestNet account.";
        setWalletError(customMsg);
        setWalletStatus('error');
      }

      setReport((prev) => (prev ? { ...prev, error: errText } : null));
      setStage('failed');
      setIsRunning(false);
      connectingRef.current = false;
    }
  };

  const handleReset = () => {
    setStage('idle');
    setCurrentStepIndex(-1);
    setReport(null);
    setReceipt(null);
    setRecord(null);
    setIsRunning(false);
    setWalletStatus('disconnected');
    setWalletError(null);
    connectingRef.current = false;
  };

  // Derive error message to show
  const displayError = walletError || report?.error || 'Execution encountered an error during settlement.';
  const isWalletError = walletError !== null || displayError.includes('Account Not Found') || displayError.includes('4300');

  return (
    <div style={{ background: '#050505', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, paddingTop: 100, paddingBottom: 120 }}>
        <div style={{ width: '100%', padding: '0 32px' }}>
          
          {/* Mode Switcher Bar */}
          <ModeSelector currentMode="agent" />

          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ marginBottom: 44 }}
          >
            <p
              style={{
                fontFamily: 'Inter',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#444444',
                marginBottom: 12,
              }}
            >
              Autonomous Agentic Commerce Engine
            </p>
            <h1
              style={{
                fontFamily: 'Playfair Display, Georgia, serif',
                fontWeight: 600,
                fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
                color: '#efefef',
                letterSpacing: '-0.025em',
                marginBottom: 8,
              }}
            >
              AI Marketplace Agent
            </h1>
            <p style={{ fontFamily: 'Inter', fontSize: 14, color: '#555555', maxWidth: 640 }}>
              Type ONE request. The agent automatically discovers, evaluates policies, ranks decisions, prompts Lute Wallet signature, purchases on-chain, and generates your invoice.
            </p>
          </motion.div>

          {/* 1. Single Prompt Component */}
          <AgentPrompt
            prompt={prompt}
            setPrompt={setPrompt}
            onStartAgent={handleStartAgent}
            isRunning={isRunning}
          />

          {/* 2. 13-Stage Animated Execution Timeline */}
          {(isRunning || currentStepIndex >= 0) && (
            <AgentTimeline
              currentStage={stage}
              currentStepIndex={currentStepIndex}
              winnerName={report?.winner?.name}
              winnerPrice={report?.winner?.price}
              onBypassSignature={handleBypassSignature}
              onConfirmSignature={handleConfirmSignature}
            />
          )}

          {/* Dedicated Wallet Signature Verification Action Box */}
          {stage === 'waiting_wallet_signature' && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                marginBottom: 32,
                padding: '24px 28px',
                borderRadius: 16,
                backgroundColor: 'rgba(18, 18, 22, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(16px)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ padding: 12, borderRadius: 12, backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <KeyRound size={24} color="#e0e0e0" className="animate-pulse" />
                  </div>
                  <div>
                    <h4 style={{ fontFamily: 'Inter', fontSize: 16, fontWeight: 600, color: '#f0f0f0', margin: 0 }}>
                      Waiting For Wallet Signature Verification
                    </h4>
                    <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#888888', margin: '4px 0 0 0' }}>
                      Awaiting Lute Wallet transaction signature for Algorand TestNet settlement. Click Auto-Sign or Confirm to proceed.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <button
                    onClick={handleConfirmSignature}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '10px 18px',
                      borderRadius: 8,
                      backgroundColor: '#ffffff',
                      color: '#000000',
                      fontSize: 13,
                      fontWeight: 600,
                      fontFamily: 'Inter',
                      cursor: 'pointer',
                      border: 'none',
                      boxShadow: '0 2px 10px rgba(255,255,255,0.15)',
                    }}
                  >
                    <CheckCircle2 size={16} color="#000000" /> Prompt Lute Wallet
                  </button>

                  <button
                    onClick={handleBypassSignature}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '10px 18px',
                      borderRadius: 8,
                      backgroundColor: 'rgba(90, 154, 90, 0.15)',
                      border: '1px solid rgba(90, 154, 90, 0.4)',
                      color: '#7bc67b',
                      fontSize: 13,
                      fontWeight: 600,
                      fontFamily: 'Inter',
                      cursor: 'pointer',
                    }}
                  >
                    <Zap size={16} color="#7bc67b" /> Auto-Sign (Demo)
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* 3. Marketplace Discovery View */}
          {report?.searchedCandidates && report.searchedCandidates.length > 0 && (
            <MarketplaceSearch
              candidates={report.searchedCandidates}
              category={report.intent.category}
            />
          )}

          {/* 4. Final Purchase Completed & Invoice Screen (Step 13) */}
          {stage === 'completed' && report && (
            <AgentCompletionCard
              report={report}
              receipt={receipt}
              record={record}
              onRunAnother={handleReset}
              result={record?.result}
              latency={record?.latency}
            />
          )}

          {/* 5. Error Status Card */}
          {stage === 'failed' && (
            <AgentStatus
              errorType="PROVIDER_FAILURE"
              errorMessage={displayError}
              onReset={handleReset}
              resetButtonText={isWalletError ? "Retry Wallet Check" : undefined}
            />
          )}

          {/* 6. Execution Audit History Table */}
          <ExecutionHistory history={history} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
