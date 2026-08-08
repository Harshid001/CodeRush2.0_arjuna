'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, AlertCircle, Circle, KeyRound, Zap } from 'lucide-react';
import type { AgentStage } from '@/context/AgentContext';

export interface TimelineStepItem {
  id: string;
  stageKey: AgentStage;
  label: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  details?: string;
}

export const AGENT_PIPELINE_STEPS: { id: string; stageKey: AgentStage; label: string; description: string }[] = [
  { id: '1', stageKey: 'understanding_request', label: 'Understanding Request', description: 'DeepSeek V4 Pro parsing category, priority, and budget constraints.' },
  { id: '2', stageKey: 'searching_marketplace', label: 'Searching Marketplace', description: 'Querying verified provider registry for active candidate nodes.' },
  { id: '3', stageKey: 'comparing_providers', label: 'Comparing Providers', description: 'Evaluating quality score, pricing, latency, and SLA reliability math.' },
  { id: '4', stageKey: 'running_policy_engine', label: 'Running Policy Engine', description: 'Enforcing per-request budget, daily max limits, and safety allowlist.' },
  { id: '5', stageKey: 'running_decision_engine', label: 'Running Decision Engine', description: 'Computing weighted matrix scores and ranking candidate providers.' },
  { id: '6', stageKey: 'selecting_provider', label: 'Selecting Provider', description: 'Generating selection rationale and policy exclusion audit logs.' },
  { id: '7', stageKey: 'creating_payment_session', label: 'Creating Payment Session', description: 'Structuring x402 cryptographic payment requirements.' },
  { id: '8', stageKey: 'waiting_wallet_signature', label: 'Waiting For Wallet Signature', description: 'Awaiting Lute Wallet transaction signature approval...' },
  { id: '9', stageKey: 'payment_confirmed', label: 'Payment Confirmed', description: 'Settling AVM payment transaction on Algorand Testnet.' },
  { id: '10', stageKey: 'provider_executed', label: 'Provider Executed', description: 'Executing provider node endpoint & receiving output payload.' },
  { id: '11', stageKey: 'result_generated', label: 'Result Generated', description: 'Validating output schema and generating structured result view.' },
  { id: '12', stageKey: 'receipt_generated', label: 'Receipt Generated', description: 'Issuing verifiable cryptographic receipt with SHA-256 hashes.' },
  { id: '13', stageKey: 'invoice_generated', label: 'Invoice Generated', description: 'Itemized invoice generated and ready for PDF download.' },
];

interface AgentTimelineProps {
  currentStage: AgentStage;
  currentStepIndex: number;
  winnerName?: string;
  winnerPrice?: string;
  onBypassSignature?: () => void;
  onConfirmSignature?: () => void;
}

export default function AgentTimeline({ currentStage, currentStepIndex, winnerName, winnerPrice, onBypassSignature, onConfirmSignature }: AgentTimelineProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        borderRadius: 20,
        backgroundColor: 'rgba(14, 14, 16, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.07)',
        padding: '28px 32px',
        boxShadow: '0 4px 32px rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(20px)',
        marginBottom: 32,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#5a9a5a', display: 'block', boxShadow: '0 0 8px rgba(90,154,90,0.8)' }} />
          <h3 style={{ fontFamily: 'Inter', fontSize: 15, fontWeight: 600, color: '#e0e0e0', margin: 0 }}>
            Autonomous Execution Pipeline
          </h3>
        </div>
        <span style={{ fontFamily: 'Inter', fontSize: 12, color: '#888888', fontWeight: 500 }}>
          {currentStepIndex >= 0 && currentStepIndex < AGENT_PIPELINE_STEPS.length
            ? `Step ${currentStepIndex + 1} of ${AGENT_PIPELINE_STEPS.length}`
            : currentStage === 'completed'
            ? '13 of 13 Completed'
            : 'Idle'}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {AGENT_PIPELINE_STEPS.map((step, idx) => {
          const isDone = currentStepIndex > idx || currentStage === 'completed';
          const isActive = currentStepIndex === idx && currentStage !== 'completed' && currentStage !== 'failed';
          const isFailed = currentStage === 'failed' && currentStepIndex === idx;

          let stepDetails: string | undefined = undefined;
          if (step.stageKey === 'selecting_provider' && winnerName && isDone) {
            stepDetails = `Selected: ${winnerName} (${winnerPrice || '$0.05'})`;
          }
          if (step.stageKey === 'waiting_wallet_signature' && isActive) {
            stepDetails = '🔑 Lute Wallet signature requested. Approve in your browser extension or click Auto-Sign below.';
          }

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.02 }}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 14,
                padding: '12px 16px',
                borderRadius: 12,
                backgroundColor: isActive
                  ? 'rgba(255, 255, 255, 0.05)'
                  : isDone
                  ? 'rgba(74, 138, 74, 0.05)'
                  : isFailed
                  ? 'rgba(239, 68, 68, 0.06)'
                  : 'rgba(255, 255, 255, 0.02)',
                border: isActive
                  ? '1px solid rgba(255, 255, 255, 0.14)'
                  : isDone
                  ? '1px solid rgba(74, 138, 74, 0.2)'
                  : isFailed
                  ? '1px solid rgba(239, 68, 68, 0.2)'
                  : '1px solid rgba(255, 255, 255, 0.04)',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Step Icon */}
              <div style={{ marginTop: 2, flexShrink: 0 }}>
                {isDone ? (
                  <CheckCircle2 size={16} color="#5a9a5a" />
                ) : isActive ? (
                  step.stageKey === 'waiting_wallet_signature' ? (
                    <KeyRound size={16} color="#e0e0e0" className="animate-pulse" />
                  ) : (
                    <Loader2 size={16} color="#aaaaaa" className="animate-spin" />
                  )
                ) : isFailed ? (
                  <AlertCircle size={16} color="#ef4444" />
                ) : (
                  <Circle size={16} color="#333333" />
                )}
              </div>

              {/* Step Info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span
                    style={{
                      fontFamily: 'Inter',
                      fontSize: 13,
                      fontWeight: 600,
                      color: isDone
                        ? '#5a9a5a'
                        : isActive
                        ? '#ffffff'
                        : isFailed
                        ? '#ef4444'
                        : '#555555',
                    }}
                  >
                    {step.label}
                  </span>
                  <span style={{ fontSize: 10, fontFamily: 'Inter', color: '#444444', textTransform: 'uppercase' }}>
                    {isDone ? 'COMPLETED' : isActive ? 'IN PROGRESS' : isFailed ? 'FAILED' : 'PENDING'}
                  </span>
                </div>

                <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#666666', margin: 0, marginTop: 3, lineHeight: 1.4 }}>
                  {step.description}
                </p>

                {stepDetails && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                    <div
                      style={{
                        padding: '6px 10px',
                        borderRadius: 6,
                        backgroundColor: 'rgba(0, 0, 0, 0.4)',
                        fontSize: 11,
                        fontFamily: 'Inter',
                        color: isActive ? '#ffffff' : '#5a9a5a',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                      }}
                    >
                      {stepDetails}
                    </div>

                    {step.stageKey === 'waiting_wallet_signature' && isActive && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          flexWrap: 'wrap',
                          padding: '10px 12px',
                          borderRadius: 8,
                          backgroundColor: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                        }}
                      >
                        {onConfirmSignature && (
                          <button
                            onClick={onConfirmSignature}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              padding: '6px 12px',
                              borderRadius: 6,
                              backgroundColor: '#ffffff',
                              color: '#000000',
                              fontSize: 11,
                              fontWeight: 600,
                              fontFamily: 'Inter',
                              cursor: 'pointer',
                              border: 'none',
                              boxShadow: '0 2px 6px rgba(255,255,255,0.1)',
                            }}
                          >
                            <CheckCircle2 size={13} color="#000000" /> Confirm / Prompt Lute
                          </button>
                        )}

                        {onBypassSignature && (
                          <button
                            onClick={onBypassSignature}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              padding: '6px 12px',
                              borderRadius: 6,
                              backgroundColor: 'rgba(90, 154, 90, 0.15)',
                              border: '1px solid rgba(90, 154, 90, 0.4)',
                              color: '#7bc67b',
                              fontSize: 11,
                              fontWeight: 600,
                              fontFamily: 'Inter',
                              cursor: 'pointer',
                            }}
                          >
                            <Zap size={13} color="#7bc67b" /> Auto-Sign (Demo)
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
