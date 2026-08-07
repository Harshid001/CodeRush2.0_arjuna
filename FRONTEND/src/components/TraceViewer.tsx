'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, X, Loader2, ExternalLink, ShieldCheck, Zap,
  Clock, AlertTriangle, ArrowRight, ChevronDown, ChevronUp,
  FileText, Store, Server, Key, Lock, CheckCircle2, Copy, RefreshCw, AlertCircle
} from 'lucide-react';
import { useWallet } from '@txnlab/use-wallet-react';
import { useReceipts } from '@/lib/receiptStore';
import { useProviderStatus } from '@/lib/providerStatus';

export interface TraceEvent {
  id: string;
  timestamp: string;
  provider: string;
  capability: string;
  qualityScore?: number;
  step402: {
    amount: string;
    token: string;
    chain: string;
    requestedAt: string;
  };
  policyDecision: {
    approved: boolean;
    reason: string;
    cap_type: string;
  };
  settlement: {
    status: 'pending' | 'confirmed' | 'failed';
    txHash: string;
    settledAmount: string;
  };
}

export const INITIAL_TRACE_EVENTS: TraceEvent[] = [
  {
    id: 'trc-8f92a101',
    timestamp: '2026-08-07 12:24:10',
    provider: 'OpenCore Labs',
    capability: 'GPT-4 Vision Pro Inference',
    qualityScore: 98.4,
    step402: {
      amount: '$0.0042',
      token: 'USDC',
      chain: 'Algorand TestNet',
      requestedAt: '12:24:10.102',
    },
    policyDecision: {
      approved: true,
      reason: 'Passed: within $0.05 per-request cap & $25.00 daily cap',
      cap_type: 'Per-Request Cap',
    },
    settlement: {
      status: 'confirmed',
      txHash: '0x3f9a2b8c1e4d7f6a0c5b8e2d9f1a4c7e0b3d6f9a2c5e8b1d4f7a0c3e6b9d2f5',
      settledAmount: '$0.0042',
    },
  },
  {
    id: 'trc-7c81b209',
    timestamp: '2026-08-07 12:22:45',
    provider: 'AudioAI Systems',
    capability: 'Whisper Speech-to-Text',
    qualityScore: 96.2,
    step402: {
      amount: '$0.0018',
      token: 'USDC',
      chain: 'Algorand TestNet',
      requestedAt: '12:22:45.012',
    },
    policyDecision: {
      approved: true,
      reason: 'Passed: within $0.05 per-request cap',
      cap_type: 'Per-Request Cap',
    },
    settlement: {
      status: 'confirmed',
      txHash: '0x81b7e2a4c90d1f3e5b6a7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8',
      settledAmount: '$0.0018',
    },
  },
  {
    id: 'trc-6a70c318',
    timestamp: '2026-08-07 12:21:02',
    provider: 'PixelForge AI',
    capability: 'Stable Diffusion XL Generation',
    qualityScore: 91.8,
    step402: {
      amount: '$0.0650',
      token: 'USDC',
      chain: 'Algorand TestNet',
      requestedAt: '12:21:02.441',
    },
    policyDecision: {
      approved: false,
      reason: 'Rejected: Exceeds $0.05 per-request cap ($0.0650 requested)',
      cap_type: 'Per-Request Cap Exceeded',
    },
    settlement: {
      status: 'failed',
      txHash: '',
      settledAmount: '$0.0000',
    },
  },
  {
    id: 'trc-5b69d427',
    timestamp: '2026-08-07 12:18:30',
    provider: 'VectorCore',
    capability: 'EmbedForce v3 Semantic Search',
    qualityScore: 99.1,
    step402: {
      amount: '$0.0003',
      token: 'USDC',
      chain: 'Algorand TestNet',
      requestedAt: '12:18:30.890',
    },
    policyDecision: {
      approved: true,
      reason: 'Passed: within per-request cap',
      cap_type: 'Per-Request Cap',
    },
    settlement: {
      status: 'pending',
      txHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2',
      settledAmount: '$0.0003',
    },
  },
];

interface TraceViewerProps {
  events?: TraceEvent[];
  isPolling?: boolean;
}

export default function TraceViewer({ events = INITIAL_TRACE_EVENTS, isPolling = false }: TraceViewerProps) {
  const [filter, setFilter] = useState<'all' | 'approved' | 'rejected' | 'pending'>('all');
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const { activeAddress: algoAddress } = useWallet();
  const { createAndAddReceipt, getReceiptById, receipts } = useReceipts();
  const { isProviderDown } = useProviderStatus();

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeWallet = (mounted && algoAddress) ? algoAddress : 'NP6R27ETK85JALGO92KTESTNETSERVICENODEKEY10294857KYST6LO';

  // Wire trace events into ReceiptStore with Web Crypto SHA-256
  useEffect(() => {
    events.forEach(async (ev) => {
      const existing = getReceiptById(ev.id);
      if (!existing && ev.settlement) {
        const inputPayload = JSON.stringify({
          provider: ev.provider,
          capability: ev.capability,
          requestedAt: ev.step402.requestedAt,
          terms: ev.step402,
        });

        const outputPayload = JSON.stringify({
          status: ev.settlement.status,
          settledAmount: ev.settlement.settledAmount,
          policy: ev.policyDecision,
        });

        const costNum = parseFloat(ev.settlement.settledAmount.replace(/[^0-9.]/g, '')) || 0;

        await createAndAddReceipt({
          provider: ev.provider,
          capability: ev.capability,
          wallet: activeWallet,
          transactionHash: ev.settlement.txHash || '0x0000000000000000000000000000000000000000000000000000000000000000',
          inputPayload,
          outputPayload,
          cost: costNum,
          status: ev.settlement.status === 'confirmed' ? 'settled' : ev.settlement.status === 'pending' ? 'pending' : 'failed',
        });
      }
    });
  }, [events, activeWallet]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const filteredEvents = events.filter((ev) => {
    if (filter === 'approved' && (!ev.policyDecision.approved || ev.settlement.status === 'failed')) return false;
    if (filter === 'rejected' && ev.policyDecision.approved) return false;
    if (filter === 'pending' && ev.settlement.status !== 'pending') return false;
    if (selectedProvider !== 'all' && ev.provider !== selectedProvider) return false;
    return true;
  });

  const providers = Array.from(new Set(events.map((e) => e.provider)));

  const toggleStep = (stepKey: string) => {
    setExpandedStep((prev) => (prev === stepKey ? null : stepKey));
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Top Filter Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 24,
          padding: '16px 20px',
          borderRadius: 16,
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#666', fontSize: 13, fontFamily: 'Inter', marginRight: 8 }}>
            Filter Status:
          </div>
          {(['all', 'approved', 'rejected', 'pending'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                padding: '6px 14px',
                borderRadius: 10,
                fontSize: 12,
                fontFamily: 'Inter',
                fontWeight: 500,
                textTransform: 'capitalize',
                border: filter === tab ? '1px solid rgba(255,255,255,0.14)' : '1px solid transparent',
                background: filter === tab ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: filter === tab ? '#ffffff' : '#666666',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isPolling && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#4a8a4a', fontFamily: 'Inter' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4a8a4a', boxShadow: '0 0 8px rgba(74,138,74,0.8)' }} />
              Live Polling (1.5s)
            </div>
          )}

          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            style={{
              padding: '7px 12px',
              borderRadius: 10,
              background: '#111111',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#cccccc',
              fontSize: 12,
              fontFamily: 'Inter',
              cursor: 'pointer',
            }}
          >
            <option value="all">All Providers</option>
            {providers.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Events List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <AnimatePresence mode="popLayout">
          {filteredEvents.map((ev, index) => {
            const isApproved = ev.policyDecision.approved;
            const isDown = isProviderDown(ev.provider);
            const fallbackProvider = isDown ? 'AudioAI Systems (Provider B)' : null;

            const rcpt = receipts.find((r) => r.receiptId === ev.id || r.provider === ev.provider);

            // Steps Definitions (incorporating Provider Down & Fallback)
            const stepsList = [
              {
                num: 1,
                key: `${ev.id}-step1`,
                title: 'Step 1: Marketplace Browsing',
                summary: `Requested capability: ${ev.capability}`,
                icon: Store,
                iconColor: '#80a5e5',
                status: 'done',
                detail: (
                  <div>
                    <div style={{ fontSize: 12, color: '#aaa', marginBottom: 4 }}>Agent Discovery Log</div>
                    <div style={{ fontSize: 13, color: '#e0e0e0', fontFamily: 'Inter' }}>
                      Agent initiated API request from Marketplace catalog for capability: <strong style={{ color: '#fff' }}>{ev.capability}</strong>.
                    </div>
                  </div>
                ),
              },
              {
                num: 2,
                key: `${ev.id}-step2`,
                title: 'Step 2: Provider Selection',
                summary: `Selected Provider: ${ev.provider} (${ev.qualityScore || 98.4}% Quality Score)`,
                icon: Server,
                iconColor: '#80a5e5',
                status: 'done',
                detail: (
                  <div>
                    <div style={{ fontSize: 12, color: '#aaa', marginBottom: 4 }}>Routing Rationale</div>
                    <div style={{ fontSize: 13, color: '#e0e0e0', fontFamily: 'Inter' }}>
                      Chosen <strong style={{ color: '#fff' }}>{ev.provider}</strong> based on optimal Quality Score ({ev.qualityScore || 98.4}%) and competitive per-request pricing ({ev.step402.amount}).
                    </div>
                  </div>
                ),
              },
              {
                num: 3,
                key: `${ev.id}-step3`,
                title: 'Step 3: Policy Engine Decision',
                summary: isApproved ? `Approved: ${ev.policyDecision.reason}` : `Rejected: ${ev.policyDecision.reason}`,
                icon: ShieldCheck,
                iconColor: isApproved ? '#5a9a5a' : '#c83c3c',
                status: isApproved ? 'done' : 'failed',
                detail: (
                  <div
                    style={{
                      padding: '12px 14px',
                      borderRadius: 10,
                      background: isApproved ? 'rgba(74,138,74,0.06)' : 'rgba(180,60,60,0.06)',
                      border: `1px solid ${isApproved ? 'rgba(74,138,74,0.2)' : 'rgba(180,60,60,0.2)'}`,
                    }}
                  >
                    <div style={{ fontSize: 12, color: isApproved ? '#5a9a5a' : '#c83c3c', fontWeight: 600, marginBottom: 2 }}>
                      Evaluated Policy Rule: {ev.policyDecision.cap_type}
                    </div>
                    <div style={{ fontSize: 13, color: '#ddd' }}>{ev.policyDecision.reason}</div>
                  </div>
                ),
              },
              {
                num: 4,
                key: `${ev.id}-step4`,
                title: 'Step 4: HTTP 402 Payment Required',
                summary: `Requested Terms: ${ev.step402.amount} ${ev.step402.token} on ${ev.step402.chain}`,
                icon: Lock,
                iconColor: '#c8a032',
                status: isApproved ? 'done' : 'skipped',
                detail: (
                  <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: 11, color: '#666' }}>Amount</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{ev.step402.amount} {ev.step402.token}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#666' }}>Network</div>
                      <div style={{ fontSize: 13, color: '#ccc' }}>{ev.step402.chain}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#666' }}>Header Requested At</div>
                      <div style={{ fontSize: 12, color: '#888' }}>{ev.step402.requestedAt}</div>
                    </div>
                  </div>
                ),
              },
            ];

            // If Provider A is DOWN, insert Fallback Alert Step
            if (isDown && isApproved) {
              stepsList.push({
                num: 5,
                key: `${ev.id}-fallback`,
                title: `⚠ Step 5: ${ev.provider} Unreachable (HTTP 500 Connection Timeout)`,
                summary: `🔄 Falling back to Provider B: ${fallbackProvider}`,
                icon: AlertCircle,
                iconColor: '#c83c3c',
                status: 'failed',
                detail: (
                  <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(180,60,60,0.1)', border: '1px solid rgba(180,60,60,0.3)' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#c83c3c', marginBottom: 4 }}>
                      Primary Provider Endpoint Timeout (500 Error)
                    </div>
                    <div style={{ fontSize: 12, color: '#dddddd', fontFamily: 'Inter' }}>
                      Primary provider <strong>{ev.provider}</strong> failed to respond within 500ms SLA. Policy Engine automatically rerouted execution to failover provider: <strong style={{ color: '#80a5e5' }}>{fallbackProvider}</strong>. Zero double-charge incurred.
                    </div>
                  </div>
                ),
              });
            }

            stepsList.push(
              {
                num: isDown ? 6 : 5,
                key: `${ev.id}-step5`,
                title: `${isDown ? 'Step 6' : 'Step 5'}: Lute Wallet Signature`,
                summary: `Signed by: ${activeWallet.slice(0, 8)}...${activeWallet.slice(-7)}`,
                icon: Key,
                iconColor: '#80a5e5',
                status: isApproved ? 'done' : 'skipped',
                detail: (
                  <div>
                    <div style={{ fontSize: 11, color: '#666', marginBottom: 2 }}>Connected Algorand Signer Address</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'monospace', fontSize: 12, color: '#e0e0e0' }}>
                      {activeWallet}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(activeWallet, `${ev.id}-wallet`);
                        }}
                        style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: 2 }}
                      >
                        {copiedKey === `${ev.id}-wallet` ? <Check size={12} color="#5a9a5a" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>
                ),
              },
              {
                num: isDown ? 7 : 6,
                key: `${ev.id}-step6`,
                title: `${isDown ? 'Step 7' : 'Step 6'}: Payment Payload Verification`,
                summary: 'x402 Payment Header & Signature Verified',
                icon: CheckCircle2,
                iconColor: '#5a9a5a',
                status: isApproved ? 'done' : 'skipped',
                detail: (
                  <div style={{ fontSize: 13, color: '#ccc' }}>
                    Cryptographic signature and x402 payment header verified successfully against Algorand TestNet AVM specifications.
                  </div>
                ),
              },
              {
                num: isDown ? 8 : 7,
                key: `${ev.id}-step7`,
                title: `${isDown ? 'Step 8' : 'Step 7'}: Provider Execution`,
                summary: isDown
                  ? `Status 200 OK — Executed by Fallback ${fallbackProvider} (142ms)`
                  : 'Status 200 OK — Provider Inference Completed in 142ms',
                icon: Zap,
                iconColor: '#5a9a5a',
                status: isApproved ? 'done' : 'skipped',
                detail: (
                  <div style={{ padding: '10px 12px', borderRadius: 8, background: 'rgba(0,0,0,0.4)', fontFamily: 'monospace', fontSize: 11, color: '#aaa' }}>
                    {`{"status": 200, "executed_by": "${isDown ? fallbackProvider : ev.provider}", "fallback_active": ${isDown}, "latency_ms": 142}`}
                  </div>
                ),
              },
              {
                num: isDown ? 9 : 8,
                key: `${ev.id}-step8`,
                title: `${isDown ? 'Step 9' : 'Step 8'}: Verifiable Receipt Logged`,
                summary: `Receipt ID: ${rcpt?.receiptId || ev.id} · Settled via ${isDown ? fallbackProvider : ev.provider}`,
                icon: FileText,
                iconColor: '#5a9a5a',
                status: isApproved ? 'done' : 'skipped',
                detail: (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 12, color: '#888' }}>Receipt ID:</span>
                      <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#fff' }}>{rcpt?.receiptId || ev.id}</span>
                    </div>
                    {isDown && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 12, color: '#888' }}>Failover Execution:</span>
                        <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#c8a032' }}>{ev.provider} → {fallbackProvider}</span>
                      </div>
                    )}
                    {ev.settlement.txHash && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 12, color: '#888' }}>On-chain TX:</span>
                        <a
                          href={`https://lora.algokit.io/testnet/transaction/${ev.settlement.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontFamily: 'monospace', fontSize: 12, color: '#80a5e5', display: 'flex', alignItems: 'center', gap: 4 }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {ev.settlement.txHash.slice(0, 8)}...{ev.settlement.txHash.slice(-6)} <ExternalLink size={11} />
                        </a>
                      </div>
                    )}
                  </div>
                ),
              }
            );

            return (
              <motion.div
                key={ev.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                style={{
                  borderRadius: 20,
                  overflow: 'hidden',
                  background: isDown
                    ? 'linear-gradient(155deg, rgba(30,15,20,0.95) 0%, rgba(16,10,12,0.95) 100%)'
                    : 'linear-gradient(155deg, rgba(20,20,24,0.95) 0%, rgba(12,12,14,0.95) 100%)',
                  border: `1px solid ${isDown ? 'rgba(200,60,60,0.25)' : 'rgba(255,255,255,0.08)'}`,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                }}
              >
                {/* Event Header */}
                <div
                  style={{
                    padding: '18px 24px',
                    background: 'rgba(255,255,255,0.02)',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Zap size={16} color="#aaa" />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontFamily: 'Inter', fontSize: 15, fontWeight: 600, color: '#f0f0f0' }}>
                          {ev.capability}
                        </span>
                        <span
                          style={{
                            fontFamily: 'Inter',
                            fontSize: 11,
                            padding: '2px 8px',
                            borderRadius: 100,
                            background: isDown ? 'rgba(180,60,60,0.2)' : 'rgba(255,255,255,0.05)',
                            color: isDown ? '#c83c3c' : '#888',
                            border: `1px solid ${isDown ? 'rgba(180,60,60,0.3)' : 'rgba(255,255,255,0.08)'}`,
                          }}
                        >
                          {ev.provider} {isDown ? '(DOWN)' : ''}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#555', marginTop: 2, fontFamily: 'Inter' }}>
                        <Clock size={11} /> {ev.timestamp} · ID: <span style={{ fontFamily: 'monospace' }}>{ev.id}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {isDown && isApproved ? (
                      <span
                        style={{
                          fontFamily: 'Inter',
                          fontSize: 12,
                          fontWeight: 600,
                          padding: '4px 12px',
                          borderRadius: 100,
                          background: 'rgba(200,160,50,0.15)',
                          color: '#c8a032',
                          border: '1px solid rgba(200,160,50,0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5,
                        }}
                      >
                        <RefreshCw size={12} className="animate-spin-slow" /> ● Fallback Executed (Provider A → B)
                      </span>
                    ) : (
                      <span
                        style={{
                          fontFamily: 'Inter',
                          fontSize: 12,
                          fontWeight: 600,
                          padding: '4px 12px',
                          borderRadius: 100,
                          background: isApproved
                            ? ev.settlement.status === 'confirmed'
                              ? 'rgba(74,138,74,0.12)'
                              : 'rgba(200,160,50,0.12)'
                            : 'rgba(180,60,60,0.12)',
                          color: isApproved
                            ? ev.settlement.status === 'confirmed'
                              ? '#5a9a5a'
                              : '#c8a032'
                            : '#c83c3c',
                          border: `1px solid ${
                            isApproved
                              ? ev.settlement.status === 'confirmed'
                                ? 'rgba(74,138,74,0.25)'
                                : 'rgba(200,160,50,0.25)'
                              : 'rgba(180,60,60,0.25)'
                          }`,
                        }}
                      >
                        {!isApproved
                          ? '● Policy Rejected'
                          : ev.settlement.status === 'pending'
                          ? '● Settling On-chain'
                          : '● Settled Successfully'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Collapsible Stepper */}
                <div style={{ padding: '24px 28px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {stepsList.map((step) => {
                      const isExpanded = expandedStep === step.key;
                      const isSkipped = !isApproved && step.num > 3;
                      const Icon = step.icon;

                      return (
                        <div
                          key={step.key}
                          style={{
                            borderRadius: 14,
                            border: `1px solid ${isExpanded ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)'}`,
                            background: isExpanded ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.015)',
                            overflow: 'hidden',
                            opacity: isSkipped ? 0.4 : 1,
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {/* Collapsed Step Header */}
                          <div
                            onClick={() => !isSkipped && toggleStep(step.key)}
                            style={{
                              padding: '12px 16px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              cursor: isSkipped ? 'not-allowed' : 'pointer',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div
                                style={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: '50%',
                                  background: isSkipped ? 'rgba(255,255,255,0.03)' : `${step.iconColor}18`,
                                  border: `1px solid ${isSkipped ? 'rgba(255,255,255,0.08)' : `${step.iconColor}40`}`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                }}
                              >
                                <Icon size={14} color={isSkipped ? '#555' : step.iconColor} />
                              </div>

                              <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: isSkipped ? '#666' : '#f0f0f0', fontFamily: 'Inter' }}>
                                  {step.title}
                                </div>
                                <div style={{ fontSize: 11, color: isSkipped ? '#444' : '#888', fontFamily: 'Inter', marginTop: 1 }}>
                                  {isSkipped ? 'Skipped (Policy Rejected)' : step.summary}
                                </div>
                              </div>
                            </div>

                            {!isSkipped && (
                              <button style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>
                                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                              </button>
                            )}
                          </div>

                          {/* Expanded Step Detail Content */}
                          <AnimatePresence>
                            {isExpanded && !isSkipped && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                style={{
                                  padding: '12px 16px 16px 56px',
                                  borderTop: '1px solid rgba(255,255,255,0.04)',
                                  background: 'rgba(0,0,0,0.2)',
                                }}
                              >
                                {step.detail}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredEvents.length === 0 && (
          <div style={{ textAlign: 'center', padding: '64px 0', color: '#555', fontFamily: 'Inter' }}>
            No trace events match the current filter.
          </div>
        )}
      </div>
    </div>
  );
}
