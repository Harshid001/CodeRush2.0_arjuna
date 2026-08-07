'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, Download, ArrowUpRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import type { AgentExecutionRecord } from '@/services/agent/ExecutionService';

interface ExecutionHistoryProps {
  history: AgentExecutionRecord[];
}

export default function ExecutionHistory({ history }: ExecutionHistoryProps) {
  if (history.length === 0) return null;

  const handleDownloadInvoiceRecord = (entry: AgentExecutionRecord) => {
    const invoiceData = {
      invoiceNumber: entry.invoiceId || `inv_${entry.id}`,
      receiptId: entry.receiptId,
      date: entry.timestamp,
      status: 'PAID',
      lineItems: [
        {
          description: `API Session - ${entry.winnerName} (${entry.category})`,
          price: entry.winnerPrice,
        },
      ],
      totalPaidUSD: entry.winnerPrice,
      transactionHash: entry.transactionHash,
      decisionScore: `${entry.decisionScore}/100`,
      rationale: entry.rationale,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(invoiceData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `invoice-${entry.invoiceId || entry.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      style={{
        borderRadius: 20,
        backgroundColor: 'rgba(14, 14, 16, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.07)',
        padding: '24px 28px',
        boxShadow: '0 4px 32px rgba(0, 0, 0, 0.5)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Clock size={16} color="#888888" />
        <h3 style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: 600, color: '#e0e0e0', margin: 0 }}>
          Autonomous Execution Audit History
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {history.map((entry) => (
          <div
            key={entry.id}
            style={{
              padding: '14px 18px',
              borderRadius: 12,
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
              transition: 'background 0.2s ease',
            }}
          >
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: 100,
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#888888',
                    fontSize: 10,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    fontFamily: 'Inter',
                  }}
                >
                  {entry.category}
                </span>
                <span style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: 600, color: '#e0e0e0' }}>{entry.prompt}</span>
              </div>
              <div style={{ fontFamily: 'Inter', fontSize: 11, color: '#555555', lineHeight: 1.4 }}>{entry.rationale}</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 600, color: '#cccccc' }}>{entry.winnerName}</div>
                <div style={{ fontFamily: 'Inter', fontSize: 11, color: '#5a9a5a' }}>{entry.winnerPrice}</div>
              </div>

              <button
                onClick={() => handleDownloadInvoiceRecord(entry)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '5px 10px',
                  borderRadius: 8,
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#cccccc',
                  fontSize: 11,
                  fontWeight: 500,
                  fontFamily: 'Inter',
                  cursor: 'pointer',
                }}
              >
                <Download size={11} /> Invoice
              </button>

              <Link
                href="/provenance"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '5px 10px',
                  borderRadius: 8,
                  backgroundColor: 'rgba(74, 138, 74, 0.08)',
                  border: '1px solid rgba(74, 138, 74, 0.2)',
                  color: '#5a9a5a',
                  fontSize: 11,
                  fontWeight: 600,
                  fontFamily: 'Inter',
                  textDecoration: 'none',
                }}
              >
                <CheckCircle2 size={12} /> Receipt <ArrowUpRight size={10} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
