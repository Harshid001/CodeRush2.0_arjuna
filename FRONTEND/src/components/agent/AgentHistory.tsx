'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, ArrowUpRight, Zap, Award } from 'lucide-react';
import Link from 'next/link';
import type { AgentHistoryEntry } from '@/services/agent/ExecutionService';

interface AgentHistoryProps {
  history: AgentHistoryEntry[];
}

export default function AgentHistory({ history }: AgentHistoryProps) {
  if (history.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      style={{
        borderRadius: 20,
        backgroundColor: 'rgba(15, 15, 20, 0.85)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '28px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <Clock size={18} color="#00e5ff" />
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', margin: 0 }}>
          Agent Execution History Audit Log
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {history.map((entry) => (
          <div
            key={entry.id}
            style={{
              padding: '16px 20px',
              borderRadius: 14,
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 14,
              transition: 'background 0.2s ease',
            }}
          >
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: 6,
                    backgroundColor: 'rgba(0, 229, 255, 0.1)',
                    color: '#00e5ff',
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                >
                  {entry.category}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#ffffff' }}>{entry.prompt}</span>
              </div>
              <div style={{ fontSize: 11, color: '#777788', lineHeight: 1.4 }}>{entry.rationale}</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#ffffff' }}>{entry.winnerName}</div>
                <div style={{ fontSize: 11, color: '#00e5ff', fontFamily: 'monospace' }}>{entry.winnerPrice}</div>
              </div>

              {entry.receiptId ? (
                <Link
                  href="/provenance"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '6px 12px',
                    borderRadius: 8,
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    color: '#10b981',
                    fontSize: 11,
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  <CheckCircle2 size={12} /> Receipt <ArrowUpRight size={11} />
                </Link>
              ) : (
                <span
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: '#888899',
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  {entry.paymentStatus}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
