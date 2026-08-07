'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Database, ArrowLeft, Bot, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ParticleBackground from '@/components/ParticleBackground';
import AgentPrompt from '@/components/agent/AgentPrompt';
import AgentTimeline, { TimelineStep } from '@/components/agent/AgentTimeline';
import MarketplaceSearch from '@/components/agent/MarketplaceSearch';
import AgentExecutionCard from '@/components/agent/AgentExecutionCard';
import AgentStatus from '@/components/agent/AgentStatus';
import AgentHistory from '@/components/agent/AgentHistory';

import { marketplaceAgent, DecisionReport } from '@/services/agent/MarketplaceAgent';
import { executionService, AgentHistoryEntry } from '@/services/agent/ExecutionService';
import { usePaymentContext } from '@/context/PaymentContext';

const INITIAL_STEPS: TimelineStep[] = [
  { id: '1', label: 'Understanding Request', description: 'Parsing task intent, required capabilities, and budget parameters.', status: 'pending' },
  { id: '2', label: 'Searching Marketplace', description: 'Querying provider registry for active API nodes.', status: 'pending' },
  { id: '3', label: 'Found Providers', description: 'Filtering eligible provider candidates matching intent.', status: 'pending' },
  { id: '4', label: 'Comparing Providers', description: 'Evaluating quality score, pricing, latency, and SLA reliability.', status: 'pending' },
  { id: '5', label: 'Running Policy Engine', description: 'Enforcing per-request budget, daily max limits, and quality thresholds.', status: 'pending' },
  { id: '6', label: 'Running Decision Engine', description: 'Computing weighted scoring matrix and ranking candidates.', status: 'pending' },
  { id: '7', label: 'Selected Best Provider', description: 'Generating selection rationale and exclusion audit trail.', status: 'pending' },
  { id: '8', label: 'Preparing Checkout', description: 'Structuring cryptographic payment requirements.', status: 'pending' },
  { id: '9', label: 'Payment Ready', description: 'Handing over session to x402 payment processor.', status: 'pending' },
];

export default function AgentPage() {
  const router = useRouter();
  const { policyLimits, spendToday } = usePaymentContext();

  const [prompt, setPrompt] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState<TimelineStep[]>(INITIAL_STEPS);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [report, setReport] = useState<DecisionReport | null>(null);
  const [history, setHistory] = useState<AgentHistoryEntry[]>([]);

  useEffect(() => {
    setHistory(executionService.getHistory());
  }, []);

  const handleStartAgent = async () => {
    if (!prompt.trim() || isRunning) return;

    setIsRunning(true);
    setReport(null);

    // Reset steps
    const resetSteps = INITIAL_STEPS.map((s) => ({ ...s, status: 'pending' as const }));
    setSteps(resetSteps);
    setCurrentStepIndex(0);

    // 1. Run Marketplace Agent Business Logic
    const resultReport = marketplaceAgent.execute(prompt, policyLimits, spendToday);

    // 2. Animate Step-by-Step Execution Timeline
    for (let i = 0; i < resetSteps.length; i++) {
      setCurrentStepIndex(i);
      setSteps((prev) =>
        prev.map((step, idx) => {
          if (idx < i) return { ...step, status: 'completed' };
          if (idx === i) {
            let details = undefined;
            if (i === 0) details = `Category: ${resultReport.intent.category} | Priority: ${resultReport.intent.priority}`;
            if (i === 1 || i === 2) details = `Found ${resultReport.searchedCandidates.length} provider candidates`;
            if (i === 4) details = `Evaluated ${resultReport.policyResults.length} candidates against policy limits`;
            if (i === 6 && resultReport.winner) details = `Winner: ${resultReport.winner.name} (${resultReport.winner.price})`;

            return { ...step, status: 'active', details };
          }
          return { ...step, status: 'pending' };
        })
      );

      // Simulate realistic autonomous reasoning delay
      await new Promise((resolve) => setTimeout(resolve, 320));
    }

    // Finish timeline
    setSteps((prev) => prev.map((step) => ({ ...step, status: 'completed' })));
    setCurrentStepIndex(resetSteps.length);
    setReport(resultReport);
    setIsRunning(false);

    // Save to history
    if (resultReport.winner) {
      const entry = executionService.saveExecution(resultReport);
      setHistory(executionService.getHistory());
    }
  };

  const handleProceedToCheckout = () => {
    if (report?.winner) {
      router.push(`/payment?providerId=${report.winner.id}`);
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        backgroundColor: '#050508',
        color: '#ffffff',
        fontFamily: "'Inter', system-ui, sans-serif",
        overflowX: 'hidden',
      }}
    >
      <ParticleBackground />
      <Navbar />

      <main style={{ position: 'relative', zIndex: 10, paddingTop: 104, paddingBottom: 100 }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px' }}>
          
          {/* Mode Switcher Banner */}
          <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Link
                href="/marketplace"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 16px',
                  borderRadius: 12,
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#aaaaaa',
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                }}
              >
                <ShoppingCart size={15} />
                <span>🛒 Manual Marketplace</span>
              </Link>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 16px',
                  borderRadius: 12,
                  backgroundColor: 'rgba(0, 229, 255, 0.1)',
                  border: '1px solid rgba(0, 229, 255, 0.3)',
                  color: '#00e5ff',
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                <Bot size={15} color="#00e5ff" />
                <span>🤖 AI Marketplace Agent (Autonomous)</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#888899' }}>
              <ShieldCheck size={14} color="#10b981" />
              <span>Policy & Decision Engine Enforced</span>
            </div>
          </div>

          {/* Page Hero Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ marginBottom: 36, textAlign: 'center' }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 16px',
                borderRadius: 999,
                backgroundColor: 'rgba(0, 229, 255, 0.08)',
                border: '1px solid rgba(0, 229, 255, 0.25)',
                color: '#00e5ff',
                fontSize: 12,
                fontWeight: 600,
                marginBottom: 16,
              }}
            >
              <Sparkles size={14} color="#00e5ff" />
              <span>Agentic AI Orchestration Engine</span>
            </div>

            <h1
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
                fontWeight: 700,
                color: '#ffffff',
                margin: 0,
                letterSpacing: '-0.025em',
              }}
            >
              AI Marketplace Agent
            </h1>
            <p style={{ fontSize: 15, color: '#888899', marginTop: 10, maxWidth: 640, margin: '10px auto 0', lineHeight: 1.6 }}>
              Describe your task in plain text and let the autonomous agent discover, compare, policy-evaluate, and purchase the best API for you.
            </p>
          </motion.div>

          {/* 1. Prompt Input Section */}
          <AgentPrompt
            prompt={prompt}
            setPrompt={setPrompt}
            onStartAgent={handleStartAgent}
            isRunning={isRunning}
          />

          {/* 2. Agent Execution Timeline */}
          {(isRunning || currentStepIndex >= 0) && (
            <AgentTimeline steps={steps} currentStepIndex={currentStepIndex} />
          )}

          {/* 3. Marketplace Discovery View */}
          {report?.searchedCandidates && report.searchedCandidates.length > 0 && (
            <MarketplaceSearch
              candidates={report.searchedCandidates}
              category={report.intent.category}
            />
          )}

          {/* 4. Decision Report Card OR Error Status */}
          {report && (
            report.error ? (
              <AgentStatus
                errorType={report.error}
                errorMessage={report.rationale}
                onReset={() => {
                  setReport(null);
                  setCurrentStepIndex(-1);
                }}
              />
            ) : (
              <AgentExecutionCard
                report={report}
                onProceedToCheckout={handleProceedToCheckout}
              />
            )
          )}

          {/* 5. Agent History Table */}
          <AgentHistory history={history} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
