'use client';

import React, { useState, useEffect, useCallback } from 'react';
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

import { marketplaceAgent, DecisionReport } from '@/services/agent/MarketplaceAgent';
import { executionService, AgentExecutionRecord } from '@/services/agent/ExecutionService';
import { intentService } from '@/services/agent/IntentService';
import { usePaymentContext } from '@/context/PaymentContext';
import { requestPaidResource } from '@/lib/x402/client';
import { INITIAL_PROVIDERS } from '@/lib/data/providers';
import { useWallet } from '@txnlab/use-wallet-react';
import { ALGORAND_TESTNET_CAIP2 } from '@x402-avm/avm';
import type { Provider, Receipt } from '@/lib/x402/types';
import type { AgentStage } from '@/context/AgentContext';

export default function AgentPage() {
  const { activeAccount, signTransactions } = useWallet();
  const { policyLimits, spendToday, usedNonces, addReceipt, addTrace } = usePaymentContext();

  const [prompt, setPrompt] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [stage, setStage] = useState<AgentStage>('idle');
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [report, setReport] = useState<DecisionReport | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [record, setRecord] = useState<AgentExecutionRecord | null>(null);
  const [history, setHistory] = useState<AgentExecutionRecord[]>([]);

  useEffect(() => {
    setHistory(executionService.getHistory());
  }, []);

  const apiToProvider = useCallback((apiItem: any): Provider => {
    const numPrice = parseFloat(apiItem.price.replace(/[^0-9.]/g, '')) || 0.05;
    const isUpto = apiItem.model?.toLowerCase().includes('cap') || apiItem.model?.toLowerCase().includes('upto');
    
    // Map to valid provider endpoint in INITIAL_PROVIDERS
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
   * Main Single-Prompt Autonomous Agent Workflow:
   * Strictly follows the project roadmap — executes DeepSeek intent parsing, candidate discovery,
   * Policy Engine, Decision Engine, and prompts real Lute Wallet signatures for x402 payment execution.
   */
  const handleStartAgent = async () => {
    if (!prompt.trim() || isRunning) return;

    setIsRunning(true);
    setReport(null);
    setReceipt(null);
    setRecord(null);

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

      // Step 8: Waiting For Wallet Signature (Prompts Lute Wallet)
      setStage('waiting_wallet_signature');
      setCurrentStepIndex(7);

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
          activeAccount,
          signTransactions,
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

      // Step 9: Payment Confirmed & Provider Executed
      setStage('payment_confirmed');
      setCurrentStepIndex(8);
      await new Promise((r) => setTimeout(r, 300));

      setStage('provider_executed');
      setCurrentStepIndex(9);
      await new Promise((r) => setTimeout(r, 300));

      // Step 10 & 11: Receipt & Invoice Generation
      addReceipt(confirmedReceipt);
      setReceipt(confirmedReceipt);

      setStage('receipt_generated');
      setCurrentStepIndex(10);
      await new Promise((r) => setTimeout(r, 300));

      // Step 12: Invoice Generated -> Completed
      const txId = confirmedReceipt.settlement?.settlementId || `tx_${Date.now()}`;
      const savedRecord = executionService.saveExecution(decisionReport, txId, confirmedReceipt.id);
      setRecord(savedRecord);
      setHistory(executionService.getHistory());

      setStage('invoice_generated');
      setCurrentStepIndex(11);
      await new Promise((r) => setTimeout(r, 300));

      setStage('completed');
      setIsRunning(false);

    } catch (err: any) {
      const errText = typeof err === 'string' ? err : err?.message || JSON.stringify(err);
      console.error('[Autonomous Agent Error]:', errText);
      setReport((prev) => (prev ? { ...prev, error: errText } : null));
      setStage('failed');
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setStage('idle');
    setCurrentStepIndex(-1);
    setReport(null);
    setReceipt(null);
    setRecord(null);
    setIsRunning(false);
  };

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

          {/* 2. 12-Stage Animated Execution Timeline */}
          {(isRunning || currentStepIndex >= 0) && (
            <AgentTimeline
              currentStage={stage}
              currentStepIndex={currentStepIndex}
              winnerName={report?.winner?.name}
              winnerPrice={report?.winner?.price}
            />
          )}

          {/* 3. Marketplace Discovery View */}
          {report?.searchedCandidates && report.searchedCandidates.length > 0 && (
            <MarketplaceSearch
              candidates={report.searchedCandidates}
              category={report.intent.category}
            />
          )}

          {/* 4. Final Purchase Completed & Invoice Screen (Step 10) */}
          {stage === 'completed' && report && (
            <AgentCompletionCard
              report={report}
              receipt={receipt}
              record={record}
              onRunAnother={handleReset}
            />
          )}

          {/* 5. Error Status Card */}
          {stage === 'failed' && (
            <AgentStatus
              errorType="PROVIDER_FAILURE"
              errorMessage={report?.error || 'Execution encountered an error during settlement.'}
              onReset={handleReset}
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
