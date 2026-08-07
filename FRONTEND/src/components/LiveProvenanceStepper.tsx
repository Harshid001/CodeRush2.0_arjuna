'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, Server, User, ExternalLink, ShieldCheck } from 'lucide-react';
import { ProvenanceRecord, ProvenanceEvent, ProvenanceStage } from '@/lib/x402/provenanceStore';

interface LiveProvenanceStepperProps {
  paymentId: string;
  onComplete?: (record: ProvenanceRecord) => void;
}

const STAGE_ORDER: { stage: ProvenanceStage; label: string; description: string }[] = [
  { stage: 'challenge_issued', label: '1. Challenge Issued', description: 'Server generated HTTP 402 requirements (payTo, price, ASA 10458941)' },
  { stage: 'signature_requested', label: '2. Signature Requested', description: 'Prompted Lute Wallet to sign atomic transaction group' },
  { stage: 'signature_received', label: '3. Signature Received', description: 'Received signed AVM transactions (address masked)' },
  { stage: 'payment_submitted', label: '4. Payment Submitted', description: 'Submitted signed payload to server for settlement' },
  { stage: 'facilitator_verify_response', label: '5. Facilitator Verification', description: 'GoPlausible verified atomic group signature' },
  { stage: 'facilitator_settle_response', label: '6. Facilitator Settlement', description: 'GoPlausible submitted transaction group to Algod TestNet' },
  { stage: 'final_state', label: '7. Final Settlement State', description: 'Confirmed on-chain settlement & issued receipt' },
];

export default function LiveProvenanceStepper({ paymentId, onComplete }: LiveProvenanceStepperProps) {
  const [record, setRecord] = useState<ProvenanceRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!paymentId) return;

    // Use fast 300ms polling with SSE fallback for live step updates
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
      } catch (err: any) {
        if (isSubscribed) setError(err.message);
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
      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
        Failed to stream provenance trace: {error}
      </div>
    );
  }

  const eventsByStage = new Map<ProvenanceStage, ProvenanceEvent>();
  if (record) {
    record.events.forEach((evt) => {
      eventsByStage.set(evt.stage, evt);
    });
  }

  return (
    <div className="w-full space-y-4 rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          <h3 className="font-semibold text-slate-100 text-sm tracking-wide">
            Live Provenance Trail & Audit Log
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">
          ID: {paymentId}
        </span>
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
        {STAGE_ORDER.map(({ stage, label, description }) => {
          const event = eventsByStage.get(stage);
          const isCompleted = event && (event.status === 'success' || event.status === 'info');
          const isFailed = event && event.status === 'failed';
          const isPending = !event;

          return (
            <motion.div
              key={stage}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative flex items-start space-x-3"
            >
              {/* Status Indicator Icon */}
              <div className="absolute -left-6 top-0.5 flex items-center justify-center">
                {isCompleted && <CheckCircle2 className="w-5 h-5 text-emerald-400 bg-slate-900 rounded-full" />}
                {isFailed && <XCircle className="w-5 h-5 text-rose-400 bg-slate-900 rounded-full" />}
                {isPending && <Loader2 className="w-4 h-4 text-indigo-400 animate-spin bg-slate-900 rounded-full" />}
              </div>

              <div className="flex-1 min-w-0 bg-slate-950/60 p-3 rounded-xl border border-slate-850 hover:border-slate-750 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-semibold ${isCompleted ? 'text-emerald-400' : isFailed ? 'text-rose-400' : 'text-slate-400'}`}>
                      {label}
                    </span>

                    {event && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-mono ${
                        event.source === 'server_observed'
                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                          : 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                      }`}>
                        {event.source === 'server_observed' ? <Server className="w-2.5 h-2.5" /> : <User className="w-2.5 h-2.5" />}
                        {event.source === 'server_observed' ? 'Server Observed' : 'Client Reported'}
                      </span>
                    )}
                  </div>

                  {event && (
                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 mt-1">
                  {event ? event.description : description}
                </p>

                {/* Event Details Preview */}
                {event && event.details && Object.keys(event.details).length > 0 && (
                  <div className="mt-2 text-[11px] font-mono bg-slate-900/80 p-2 rounded-lg text-slate-300 border border-slate-800/80 overflow-x-auto space-y-1">
                    {Object.entries(event.details).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between">
                        <span className="text-slate-500">{k}:</span>
                        <span className="text-slate-200 font-semibold">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Algorand Explorer Link on Final State */}
                {stage === 'final_state' && record?.confirmedTxId && record.confirmedTxId.length > 20 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified On-Chain Settlement
                    </span>
                    <a
                      href={`https://testnet.algoexplorer.io/tx/${record.confirmedTxId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-mono underline"
                    >
                      Explorer Link <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
