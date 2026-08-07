'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Award, Zap, ArrowRight, ShieldCheck, XCircle } from 'lucide-react';
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
        borderRadius: 20,
        background: 'linear-gradient(155deg, rgba(22,22,26,0.95) 0%, rgba(12,12,14,0.95) 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        padding: '32px 36px',
        boxShadow: '0 4px 32px rgba(0,0,0,0.5)',
        marginBottom: 32,
      }}
    >
      {/* Winner Header Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: 'rgba(74, 138, 74, 0.1)',
              border: '1px solid rgba(74, 138, 74, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Award size={20} color="#5a9a5a" />
          </div>
          <div>
            <div style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 600, color: '#5a9a5a', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Decision Engine Winner
            </div>
            <h3 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 22, fontWeight: 600, color: '#efefef', margin: 0 }}>
              {winner.name}
            </h3>
          </div>
        </div>

        <div
          style={{
            padding: '6px 14px',
            borderRadius: 100,
            backgroundColor: 'rgba(74, 138, 74, 0.1)',
            border: '1px solid rgba(74, 138, 74, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span style={{ fontFamily: 'Inter', fontSize: 11, color: '#555555' }}>Decision Score</span>
          <span style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: 700, color: '#5a9a5a' }}>
            {report.winnerScore || 92.5} / 100
          </span>
        </div>
      </div>

      {/* Rationale Section */}
      <div
        style={{
          borderRadius: 14,
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.04)',
          padding: 18,
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontFamily: 'Inter', fontSize: 12, fontWeight: 600, color: '#888888' }}>
          <ShieldCheck size={14} color="#5a9a5a" />
          <span>Autonomous Selection Rationale</span>
        </div>
        <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#aaaaaa', margin: 0, lineHeight: 1.5 }}>
          {report.rationale}
        </p>
      </div>

      {/* Specs Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 24 }} className="grid-cols-2 md:grid-cols-4">
        <div style={{ padding: 12, borderRadius: 12, backgroundColor: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
          <div style={{ fontFamily: 'Inter', fontSize: 11, color: '#555555', marginBottom: 3 }}>Price per Request</div>
          <div style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: 600, color: '#e0e0e0' }}>{winner.price}</div>
        </div>

        <div style={{ padding: 12, borderRadius: 12, backgroundColor: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
          <div style={{ fontFamily: 'Inter', fontSize: 11, color: '#555555', marginBottom: 3 }}>Quality Score</div>
          <div style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: 600, color: '#5a9a5a' }}>{winner.qualityScore || 90}%</div>
        </div>

        <div style={{ padding: 12, borderRadius: 12, backgroundColor: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
          <div style={{ fontFamily: 'Inter', fontSize: 11, color: '#555555', marginBottom: 3 }}>Average Latency</div>
          <div style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: 600, color: '#888888' }}>{winner.latency || 120}ms</div>
        </div>

        <div style={{ padding: 12, borderRadius: 12, backgroundColor: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
          <div style={{ fontFamily: 'Inter', fontSize: 11, color: '#555555', marginBottom: 3 }}>Payment Scheme</div>
          <div style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: 600, color: '#cccccc' }}>x402 Algorand</div>
        </div>
      </div>

      {/* Rejected Candidates Breakdown */}
      {report.rejectedCandidates.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 600, color: '#555555', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
            Policy Exclusions ({report.rejectedCandidates.length} Rejected)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {report.rejectedCandidates.map((rej, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: 8,
                  backgroundColor: 'rgba(239, 68, 68, 0.04)',
                  border: '1px solid rgba(239, 68, 68, 0.12)',
                  fontSize: 12,
                  fontFamily: 'Inter',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#ef4444' }}>
                  <XCircle size={13} />
                  <span style={{ fontWeight: 600 }}>{rej.api.name}</span>
                </div>
                <span style={{ color: '#666666', fontSize: 11 }}>{rej.reason}</span>
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
            gap: 8,
            padding: '13px 28px',
            borderRadius: 13,
            backgroundColor: '#f0f0f0',
            color: '#050505',
            fontSize: 14,
            fontWeight: 600,
            fontFamily: 'Inter',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 24px rgba(255, 255, 255, 0.12)',
            transition: 'all 0.25s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#ffffff';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f0f0f0';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <Zap size={16} color="#050505" />
          <span>Proceed to Checkout & Pay ({winner.price})</span>
          <ArrowRight size={16} color="#050505" />
        </button>
      </div>
    </motion.div>
  );
}
