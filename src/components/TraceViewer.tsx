'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, X, Loader2, ExternalLink, ShieldCheck, Zap,
  Clock, AlertTriangle, ArrowRight, CornerDownRight, Filter
} from 'lucide-react';

export interface TraceEvent {
  id: string;
  timestamp: string;
  provider: string;
  capability: string;
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
    step402: {
      amount: '$0.0042',
      token: 'USDC',
      chain: 'Base Sepolia',
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
    step402: {
      amount: '$0.0018',
      token: 'USDC',
      chain: 'Base Sepolia',
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
    step402: {
      amount: '$0.0650',
      token: 'USDC',
      chain: 'Base Sepolia',
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
    step402: {
      amount: '$0.0003',
      token: 'USDC',
      chain: 'Base Sepolia',
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

  const filteredEvents = events.filter((ev) => {
    if (filter === 'approved' && (!ev.policyDecision.approved || ev.settlement.status === 'failed')) return false;
    if (filter === 'rejected' && ev.policyDecision.approved) return false;
    if (filter === 'pending' && ev.settlement.status !== 'pending') return false;
    if (selectedProvider !== 'all' && ev.provider !== selectedProvider) return false;
    return true;
  });

  const providers = Array.from(new Set(events.map((e) => e.provider)));

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
            <Filter size={14} /> Filter Status:
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
          {filteredEvents.map((ev, index) => (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              style={{
                borderRadius: 20,
                overflow: 'hidden',
                background: 'linear-gradient(155deg, rgba(20,20,24,0.95) 0%, rgba(12,12,14,0.95) 100%)',
                border: '1px solid rgba(255,255,255,0.08)',
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
                          background: 'rgba(255,255,255,0.05)',
                          color: '#888',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        {ev.provider}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#555', marginTop: 2, fontFamily: 'Inter' }}>
                      <Clock size={11} /> {ev.timestamp} · ID: <span style={{ fontFamily: 'monospace' }}>{ev.id}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      fontFamily: 'Inter',
                      fontSize: 12,
                      fontWeight: 600,
                      padding: '4px 12px',
                      borderRadius: 100,
                      background: ev.policyDecision.approved
                        ? ev.settlement.status === 'confirmed'
                          ? 'rgba(74,138,74,0.12)'
                          : 'rgba(200,160,50,0.12)'
                        : 'rgba(180,60,60,0.12)',
                      color: ev.policyDecision.approved
                        ? ev.settlement.status === 'confirmed'
                          ? '#5a9a5a'
                          : '#c8a032'
                        : '#c83c3c',
                      border: `1px solid ${
                        ev.policyDecision.approved
                          ? ev.settlement.status === 'confirmed'
                            ? 'rgba(74,138,74,0.25)'
                            : 'rgba(200,160,50,0.25)'
                          : 'rgba(180,60,60,0.25)'
                      }`,
                    }}
                  >
                    {!ev.policyDecision.approved
                      ? '● Policy Rejected'
                      : ev.settlement.status === 'pending'
                      ? '● Settling On-chain'
                      : '● Settled Successfully'}
                  </span>
                </div>
              </div>

              {/* Lifecycle Vertical Stepper */}
              <div style={{ padding: '24px 28px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'relative' }}>

                  {/* STEP 1: HTTP 402 Payment Required */}
                  <div style={{ display: 'flex', gap: 18, position: 'relative', paddingBottom: 24 }}>
                    {/* Connecting Vertical Line */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 28,
                        left: 15,
                        bottom: 0,
                        width: 2,
                        background: 'rgba(255,255,255,0.08)',
                      }}
                    />

                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: 'rgba(200,160,50,0.15)',
                        border: '1px solid rgba(200,160,50,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        zIndex: 2,
                      }}
                    >
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#c8a032', fontFamily: 'monospace' }}>402</span>
                    </div>

                    <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#e0e0e0', fontFamily: 'Inter' }}>
                          Step 1: HTTP 402 Payment Required
                        </div>
                        <span style={{ fontSize: 11, color: '#555', fontFamily: 'Inter' }}>{ev.step402.requestedAt}</span>
                      </div>
                      <div
                        style={{
                          padding: '12px 16px',
                          borderRadius: 12,
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.05)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: 12,
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 11, color: '#555', fontFamily: 'Inter' }}>Requested Payment Terms</div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#dddddd', fontFamily: 'Inter', marginTop: 2 }}>
                            {ev.step402.amount} {ev.step402.token}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 16 }}>
                          <div>
                            <div style={{ fontSize: 11, color: '#555', fontFamily: 'Inter' }}>Token</div>
                            <div style={{ fontSize: 12, fontWeight: 500, color: '#aaa', fontFamily: 'Inter' }}>{ev.step402.token}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 11, color: '#555', fontFamily: 'Inter' }}>Network</div>
                            <div style={{ fontSize: 12, fontWeight: 500, color: '#aaa', fontFamily: 'Inter' }}>{ev.step402.chain}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* STEP 2: Policy Engine Decision */}
                  <div style={{ display: 'flex', gap: 18, position: 'relative', paddingBottom: 24 }}>
                    {/* Connecting Vertical Line */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 28,
                        left: 15,
                        bottom: 0,
                        width: 2,
                        background: 'rgba(255,255,255,0.08)',
                      }}
                    />

                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: ev.policyDecision.approved ? 'rgba(74,138,74,0.15)' : 'rgba(180,60,60,0.15)',
                        border: `1px solid ${ev.policyDecision.approved ? 'rgba(74,138,74,0.3)' : 'rgba(180,60,60,0.3)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        zIndex: 2,
                      }}
                    >
                      {ev.policyDecision.approved ? (
                        <ShieldCheck size={16} color="#5a9a5a" />
                      ) : (
                        <X size={16} color="#c83c3c" />
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#e0e0e0', fontFamily: 'Inter' }}>
                          Step 2: Policy Engine Decision
                        </div>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 500,
                            color: ev.policyDecision.approved ? '#5a9a5a' : '#c83c3c',
                            fontFamily: 'Inter',
                          }}
                        >
                          {ev.policyDecision.approved ? 'Approved' : 'Rejected'}
                        </span>
                      </div>
                      <div
                        style={{
                          padding: '12px 16px',
                          borderRadius: 12,
                          background: ev.policyDecision.approved ? 'rgba(74,138,74,0.04)' : 'rgba(180,60,60,0.04)',
                          border: `1px solid ${ev.policyDecision.approved ? 'rgba(74,138,74,0.12)' : 'rgba(180,60,60,0.12)'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: 12,
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 11, color: '#666', fontFamily: 'Inter' }}>Evaluated Rule</div>
                          <div style={{ fontSize: 13, color: '#cccccc', fontFamily: 'Inter', marginTop: 2 }}>
                            {ev.policyDecision.reason}
                          </div>
                        </div>
                        <span
                          style={{
                            fontSize: 11,
                            padding: '3px 9px',
                            borderRadius: 6,
                            background: 'rgba(255,255,255,0.05)',
                            color: '#888',
                            fontFamily: 'Inter',
                          }}
                        >
                          {ev.policyDecision.cap_type}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* STEP 3: On-chain Settlement */}
                  <div style={{ display: 'flex', gap: 18, position: 'relative' }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background:
                          ev.settlement.status === 'confirmed'
                            ? 'rgba(74,138,74,0.15)'
                            : ev.settlement.status === 'pending'
                            ? 'rgba(200,160,50,0.15)'
                            : 'rgba(180,60,60,0.15)',
                        border: `1px solid ${
                          ev.settlement.status === 'confirmed'
                            ? 'rgba(74,138,74,0.3)'
                            : ev.settlement.status === 'pending'
                            ? 'rgba(200,160,50,0.3)'
                            : 'rgba(180,60,60,0.3)'
                        }`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        zIndex: 2,
                      }}
                    >
                      {ev.settlement.status === 'confirmed' ? (
                        <Check size={16} color="#5a9a5a" />
                      ) : ev.settlement.status === 'pending' ? (
                        <Loader2 size={16} color="#c8a032" className="animate-spin-slow" />
                      ) : (
                        <X size={16} color="#c83c3c" />
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#e0e0e0', fontFamily: 'Inter' }}>
                          Step 3: On-chain Settlement (Base Sepolia)
                        </div>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 500,
                            textTransform: 'capitalize',
                            color:
                              ev.settlement.status === 'confirmed'
                                ? '#5a9a5a'
                                : ev.settlement.status === 'pending'
                                ? '#c8a032'
                                : '#c83c3c',
                            fontFamily: 'Inter',
                          }}
                        >
                          {ev.settlement.status}
                        </span>
                      </div>

                      <div
                        style={{
                          padding: '12px 16px',
                          borderRadius: 12,
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.05)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: 12,
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 11, color: '#555', fontFamily: 'Inter' }}>Settled Amount</div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#e0e0e0', fontFamily: 'Inter', marginTop: 2 }}>
                            {ev.settlement.settledAmount}
                          </div>
                        </div>

                        {ev.settlement.txHash ? (
                          <a
                            href={`https://sepolia.basescan.org/tx/${ev.settlement.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: '8px 14px',
                              borderRadius: 10,
                              background: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(255,255,255,0.08)',
                              color: '#bbbbbb',
                              fontSize: 12,
                              fontFamily: 'monospace',
                              textDecoration: 'none',
                              transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)';
                              e.currentTarget.style.color = '#ffffff';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                              e.currentTarget.style.color = '#bbbbbb';
                            }}
                          >
                            <span>
                              {ev.settlement.txHash.slice(0, 8)}...{ev.settlement.txHash.slice(-6)}
                            </span>
                            <ExternalLink size={12} color="#888" />
                          </a>
                        ) : (
                          <span style={{ fontSize: 12, color: '#555', fontFamily: 'Inter' }}>No transaction emitted</span>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          ))}
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
