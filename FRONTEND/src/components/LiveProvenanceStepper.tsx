'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle2, XCircle, Server, User, ExternalLink, ShieldCheck, Clock,
} from 'lucide-react';
import { ProvenanceRecord, ProvenanceEvent, ProvenanceStage } from '@/lib/x402/provenanceStore';

interface LiveProvenanceStepperProps {
  paymentId: string;
  onComplete?: (record: ProvenanceRecord) => void;
}

const STAGE_ORDER: { stage: ProvenanceStage; label: string; description: string }[] = [
  { stage: 'challenge_issued', label: 'Challenge Issued', description: 'Server generated HTTP 402 requirements (payTo, price, ASA 10458941)' },
  { stage: 'signature_requested', label: 'Signature Requested', description: 'Prompted Lute Wallet to sign atomic transaction group' },
  { stage: 'signature_received', label: 'Signature Received', description: 'Received signed AVM transactions (address masked)' },
  { stage: 'payment_submitted', label: 'Payment Submitted', description: 'Submitted signed payload to server for settlement' },
  { stage: 'facilitator_verify_response', label: 'Facilitator Verification', description: 'GoPlausible verified atomic group signature' },
  { stage: 'facilitator_settle_response', label: 'Facilitator Settlement', description: 'GoPlausible submitted transaction group to Algod TestNet' },
  { stage: 'final_state', label: 'Final Settlement State', description: 'Confirmed on-chain settlement & issued receipt' },
];

// Per-stage accent (legible on dark surfaces).
const STAGE_ACCENT: Record<ProvenanceStage, string> = {
  challenge_issued: '#00e5ff',
  signature_requested: '#f5b544',
  signature_received: '#f5b544',
  payment_submitted: '#a855f7',
  facilitator_verify_response: '#a855f7',
  facilitator_settle_response: '#10b981',
  final_state: '#10b981',
};

export default function LiveProvenanceStepper({ paymentId, onComplete }: LiveProvenanceStepperProps) {
  const [record, setRecord] = useState<ProvenanceRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!paymentId) return;

    // Use fast 350ms polling for live step updates
    let isSubscribed = true;

    const fetchTrace = async () => {
      try {
        const res = await fetch(`/api/payments/${paymentId}/trace`, {
          headers: { Accept: 'application/json' },
          cache: 'no-store',
        });
        if (res.ok) {
          const data: ProvenanceRecord = await res.json();
          if (isSubscribed) {
            setRecord(data);
            if (data.status === 'settled' || data.status === 'failed') {
              if (onComplete) onComplete(data);
            }
          }
        }
      } catch (err) {
        if (isSubscribed) setError(err instanceof Error ? err.message : String(err));
      }
    };

    fetchTrace();
    const interval = setInterval(fetchTrace, 350);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [paymentId, onComplete]);

  if (error) {
    return (
      <div className="glass-panel glow-border" style={{ padding: 22 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <XCircle size={20} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 650, color: 'var(--text)' }}>Unable to stream trace</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-2)', marginTop: 4, lineHeight: 1.5 }}>{error}</div>
          </div>
        </div>
      </div>
    );
  }

  const eventsByStage = new Map<ProvenanceStage, ProvenanceEvent>();
  if (record) {
    record.events.forEach((evt) => {
      eventsByStage.set(evt.stage, evt);
    });
  }

  const doneCount = STAGE_ORDER.filter(({ stage }) => {
    const e = eventsByStage.get(stage);
    return e && (e.status === 'success' || e.status === 'info');
  }).length;

  const settled = record?.status === 'settled';

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="glass-panel glow-border"
      style={{ padding: 24 }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 38, height: 38, borderRadius: 12, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.3)',
              boxShadow: '0 0 22px rgba(0,229,255,0.25)',
            }}
          >
            <ShieldCheck size={18} color="#00e5ff" />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>
              Live Provenance Trail
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Audit log · x402 on Algorand TestNet</div>
          </div>
        </div>
        <span
          className="mono"
          style={{
            fontSize: 11, color: 'var(--text-2)', padding: '4px 10px', borderRadius: 999,
            background: 'var(--surface-2)', border: '1px solid var(--border)',
          }}
        >
          {paymentId}
        </span>
      </div>

      {/* Progress rail */}
      <div style={{ marginTop: 20, marginBottom: 4 }}>
        <div style={{ height: 4, borderRadius: 999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <motion.div
            animate={{ width: `${(doneCount / STAGE_ORDER.length) * 100}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{
              height: '100%', borderRadius: 999,
              background: 'linear-gradient(90deg, var(--cyan), var(--purple))',
              boxShadow: '0 0 12px rgba(0,229,255,0.5)',
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: 'var(--text-3)' }}>
          <span className="mono">{doneCount}/{STAGE_ORDER.length} observed</span>
          <span>
            {settled ? 'settled' : record?.status === 'failed' ? 'failed' : 'in progress'}
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative pl-7" style={{ marginTop: 18 }}>
        {/* connecting rail */}
        <div className="absolute left-[13px] top-1 bottom-1 w-px" style={{ background: 'rgba(255,255,255,0.08)' }} />

        {STAGE_ORDER.map(({ stage, label, description }, index) => {
          const event = eventsByStage.get(stage);
          const isCompleted = event && (event.status === 'success' || event.status === 'info');
          const isFailed = event && event.status === 'failed';
          const isPending = !event;
          const accent = isFailed ? '#ef4444' : isCompleted ? STAGE_ACCENT[stage] : '#3a3a45';

          return (
            <motion.div
              key={stage}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.03, ease: [0.16, 1, 0.3, 1] }}
              style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', gap: 12, paddingBottom: 14 }}
            >
              {/* Node */}
              <div
                className="absolute -left-7 top-0.5 flex items-center justify-center"
                style={{ width: 26, height: 26, borderRadius: '50%' }}
              >
                <div
                  style={{
                    width: 26, height: 26, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isPending ? 'rgba(255,255,255,0.04)' : `color-mix(in srgb, ${accent} 14%, transparent)`,
                    border: `1px solid ${isPending ? 'rgba(255,255,255,0.12)' : accent}`,
                    boxShadow: isPending ? 'none' : `0 0 14px color-mix(in srgb, ${accent} 28%, transparent)`,
                    color: isPending ? '#555' : accent,
                  }}
                >
                  {isFailed ? (
                    <XCircle size={13} />
                  ) : isCompleted ? (
                    <CheckCircle2 size={13} />
                  ) : (
                    <Clock size={12} />
                  )}
                </div>
              </div>

              {/* Card */}
              <motion.div
                whileHover={isPending ? undefined : { y: -2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                style={{
                  flex: 1, minWidth: 0,
                  padding: '12px 15px', borderRadius: 14,
                  background: isPending ? 'rgba(255,255,255,0.015)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isFailed ? 'rgba(239,68,68,0.4)' : isPending ? 'var(--border)' : 'rgba(255,255,255,0.12)'}`,
                  opacity: isPending ? 0.55 : 1,
                  transition: 'all 0.3s cubic-bezier(.4,0,.2,1)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: 12.5, fontWeight: 650, letterSpacing: '-0.01em',
                        color: isPending ? '#888' : isFailed ? '#ffb3b3' : 'var(--text)',
                      }}
                    >
                      {String(index + 1).padStart(2, '0')} · {label}
                    </span>

                    {event && (
                      <span
                        className="mono"
                        style={{
                          fontSize: 10, padding: '2px 8px', borderRadius: 100, fontWeight: 600,
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          color: event.source === 'server_observed' ? '#10b981' : '#f5b544',
                          background: event.source === 'server_observed' ? 'rgba(16,185,129,0.1)' : 'rgba(245,181,68,0.1)',
                          border: `1px solid ${event.source === 'server_observed' ? 'rgba(16,185,129,0.28)' : 'rgba(245,181,68,0.28)'}`,
                        }}
                      >
                        {event.source === 'server_observed' ? <Server size={10} /> : <User size={10} />}
                        {event.source === 'server_observed' ? 'server-observed' : 'client-reported'}
                      </span>
                    )}
                  </div>

                  {event && (
                    <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  )}
                </div>

                <p style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 4, lineHeight: 1.5 }}>
                  {event ? event.description : description}
                </p>

                {/* Event Details Preview */}
                <AnimatePresence>
                  {event && event.details && Object.keys(event.details).length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mono"
                      style={{
                        marginTop: 9, padding: 10, borderRadius: 10, fontSize: 11, overflow: 'hidden',
                        background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)',
                      }}
                    >
                      {Object.entries(event.details).map(([k, v]) => (
                        <div key={k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                          <span style={{ color: 'var(--text-3)' }}>{k}:</span>
                          <span style={{ color: 'var(--text-2)', fontWeight: 600, textAlign: 'right', wordBreak: 'break-all' }}>{String(v)}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Algorand Explorer Link on Final State */}
                {stage === 'final_state' && settled && record?.confirmedTxId && record.confirmedTxId.length > 20 && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12, color: '#10b981', fontWeight: 600,
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                      }}
                    >
                      <CheckCircle2 size={13} /> Verified On-Chain Settlement
                    </span>
                    <a
                      href={`https://testnet.algoexplorer.io/tx/${record.confirmedTxId}`}
                      target="_blank" rel="noopener noreferrer"
                      className="mono"
                      style={{
                        fontSize: 11, color: '#00e5ff', textDecoration: 'none',
                        display: 'inline-flex', alignItems: 'center', gap: 5, wordBreak: 'break-all',
                      }}
                    >
                      {record.confirmedTxId.slice(0, 12)}…<ExternalLink size={12} />
                    </a>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}