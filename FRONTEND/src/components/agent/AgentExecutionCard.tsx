'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Award, Zap, ArrowRight, ShieldCheck, CheckCircle2, AlertTriangle, ChevronRight, XCircle } from 'lucide-react';
import type { DecisionReport } from '@/services/agent/MarketplaceAgent';

interface AgentExecutionCardProps {
  report: DecisionReport;
  onProceedToCheckout: () => void;
}

export default function AgentExecutionCard({ report, onProceedToCheckout }: AgentExecutionCardProps) {
  const winner = report.winner;
  if (!winner) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      style={{
        borderRadius: 24,
        backgroundColor: 'rgba(15, 15, 20, 0.95)',
        border: '1px solid rgba(0, 229, 255, 0.4)',
        padding: '36px',
        boxShadow: '0 30px 90px rgba(0, 0, 0, 0.9), 0 0 50px rgba(0, 229, 255, 0.15)',
        backdropFilter: 'blur(20px)',
        marginBottom: 32,
      }}
    >
      {/* Winner Header Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(0, 229, 255, 0.2))',
              border: '1px solid rgba(16, 185, 129, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)',
            }}
          >
            <Award size={24} color="#10b981" />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Decision Engine Winner Selected
            </div>
            <h3 style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>
              {winner.name}
            </h3>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              padding: '6px 14px',
              borderRadius: 12,
              backgroundColor: 'rgba(0, 229, 255, 0.1)',
              border: '1px solid rgba(0, 229, 255, 0.3)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 10, color: '#888899', textTransform: 'uppercase' }}>Decision Score</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#00e5ff', fontFamily: 'monospace' }}>
              {report.winnerScore || 92.5} / 100
            </div>
          </div>
        </div>
      </div>

      {/* Rationale Section */}
      <div
        style={{
          borderRadius: 16,
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: 20,
          marginBottom: 24,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 12, fontWeight: 700, color: '#00e5ff' }}>
          <ShieldCheck size={16} color="#00e5ff" />
          <span>Autonomous Selection Rationale</span>
        </div>
        <p style={{ fontSize: 13, color: '#cccccc', margin: 0, lineHeight: 1.6, fontFamily: 'Inter' }}>
          {report.rationale}
        </p>
      </div>

      {/* Specs Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }} className="grid-cols-2 md:grid-cols-4">
        <div style={{ padding: 14, borderRadius: 12, backgroundColor: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <div style={{ fontSize: 11, color: '#888899', marginBottom: 4 }}>Price per Request</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#00e5ff', fontFamily: 'monospace' }}>{winner.price}</div>
        </div>

        <div style={{ padding: 14, borderRadius: 12, backgroundColor: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <div style={{ fontSize: 11, color: '#888899', marginBottom: 4 }}>Quality Score</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#10b981', fontFamily: 'monospace' }}>{winner.qualityScore || 90}%</div>
        </div>

        <div style={{ padding: 14, borderRadius: 12, backgroundColor: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <div style={{ fontSize: 11, color: '#888899', marginBottom: 4 }}>Average Latency</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', fontFamily: 'monospace' }}>{winner.latency || 120}ms</div>
        </div>

        <div style={{ padding: 14, borderRadius: 12, backgroundColor: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <div style={{ fontSize: 11, color: '#888899', marginBottom: 4 }}>Payment Protocol</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#a855f7', fontFamily: 'monospace' }}>x402 Algorand</div>
        </div>
      </div>

      {/* Rejected Candidates Breakdown */}
      {report.rejectedCandidates.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#888899', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
            Policy Exclusions ({report.rejectedCandidates.length} Rejected)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {report.rejectedCandidates.map((rej, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: 10,
                  backgroundColor: 'rgba(239, 68, 68, 0.05)',
                  border: '1px solid rgba(239, 68, 68, 0.15)',
                  fontSize: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444' }}>
                  <XCircle size={14} />
                  <span style={{ fontWeight: 600 }}>{rej.api.name}</span>
                </div>
                <span style={{ color: '#aaaabb', fontSize: 11 }}>{rej.reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Primary Action Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={onProceedToCheckout}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            padding: '16px 36px',
            borderRadius: 16,
            background: 'linear-gradient(135deg, #10b981 0%, #00e5ff 100%)',
            color: '#000000',
            fontSize: 16,
            fontWeight: 800,
            fontFamily: 'Inter',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 12px 35px rgba(16, 185, 129, 0.35)',
            transition: 'transform 0.15s ease',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <Zap size={20} color="#000000" />
          <span>Proceed to Checkout & Pay ({winner.price})</span>
          <ArrowRight size={20} color="#000000" />
        </button>
      </div>
    </motion.div>
  );
}
