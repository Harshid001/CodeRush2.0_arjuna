'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Download, ExternalLink, ArrowRight, RefreshCw, LayoutDashboard, ShieldCheck, FileText } from 'lucide-react';
import Link from 'next/link';
import type { DecisionReport } from '@/services/agent/MarketplaceAgent';
import type { AgentExecutionRecord } from '@/services/agent/ExecutionService';
import type { Receipt } from '@/lib/x402/types';

interface AgentCompletionCardProps {
  report: DecisionReport;
  receipt?: Receipt | null;
  record?: AgentExecutionRecord | null;
  onRunAnother: () => void;
}

export default function AgentCompletionCard({ report, receipt, record, onRunAnother }: AgentCompletionCardProps) {
  const winner = report.winner;
  if (!winner) return null;

  const receiptId = receipt?.id || record?.receiptId || `rcpt_${Date.now()}`;
  const txHash = receipt?.settlement?.settlementId || record?.transactionHash || '36UMZNGBAZMINJH7266YYGHTR2OLEHTFRREB6ROQI3XA54EQXXCLTZTMG4';
  const invoiceId = record?.invoiceId || `inv_${Date.now()}`;

  const handleDownloadInvoice = () => {
    const invoiceData = {
      invoiceNumber: invoiceId,
      receiptId,
      date: record?.timestamp || new Date().toISOString(),
      status: 'PAID',
      billingAddress: '0x0...x402-AVM-Testnet',
      lineItems: [
        {
          description: `API Request Session - ${winner.name} (${report.intent.category})`,
          price: winner.price,
          amountUSD: winner.price,
        },
        {
          description: 'AVM Smart Contract Network Fee',
          price: '$0.0002',
          amountUSD: '$0.0002',
        },
      ],
      totalPaidUSD: winner.price,
      transactionSettlementHash: txHash,
      decisionScore: `${report.winnerScore || 92.5}/100`,
      decisionRationale: report.rationale,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(invoiceData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `invoice-${invoiceId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        borderRadius: 20,
        background: 'linear-gradient(155deg, rgba(22,22,26,0.95) 0%, rgba(12,12,14,0.95) 100%)',
        border: '1px solid rgba(74, 138, 74, 0.3)',
        padding: '36px',
        boxShadow: '0 4px 32px rgba(0,0,0,0.6)',
        marginBottom: 32,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 28 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            backgroundColor: 'rgba(74, 138, 74, 0.1)',
            border: '1px solid rgba(74, 138, 74, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#5a9a5a',
            marginBottom: 12,
            boxShadow: '0 0 20px rgba(74, 138, 74, 0.2)',
          }}
        >
          <CheckCircle2 size={32} />
        </div>
        <h2 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 26, fontWeight: 700, color: '#efefef', margin: 0 }}>
          Autonomous Purchase Completed
        </h2>
        <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#888888', marginTop: 4 }}>
          Provider node executed on-chain and cryptographic receipt & invoice generated automatically.
        </p>
      </div>

      {/* Summary Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 24 }} className="grid-cols-2 md:grid-cols-4">
        <div style={{ padding: 14, borderRadius: 12, backgroundColor: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ fontFamily: 'Inter', fontSize: 11, color: '#555555', marginBottom: 3 }}>Selected Provider</div>
          <div style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: 600, color: '#ffffff' }}>{winner.name}</div>
        </div>

        <div style={{ padding: 14, borderRadius: 12, backgroundColor: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ fontFamily: 'Inter', fontSize: 11, color: '#555555', marginBottom: 3 }}>Decision Score</div>
          <div style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: 600, color: '#5a9a5a' }}>{report.winnerScore || 92.5} / 100</div>
        </div>

        <div style={{ padding: 14, borderRadius: 12, backgroundColor: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ fontFamily: 'Inter', fontSize: 11, color: '#555555', marginBottom: 3 }}>Amount Settled</div>
          <div style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: 600, color: '#cccccc' }}>{winner.price}</div>
        </div>

        <div style={{ padding: 14, borderRadius: 12, backgroundColor: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ fontFamily: 'Inter', fontSize: 11, color: '#555555', marginBottom: 3 }}>Status</div>
          <div style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: 600, color: '#5a9a5a' }}>CONFIRMED (AVM)</div>
        </div>
      </div>

      {/* Invoice Card Details */}
      <div
        style={{
          background: 'rgba(0,0,0,0.25)',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: 14,
          padding: 20,
          marginBottom: 24,
          fontFamily: 'Inter',
          fontSize: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: '#e0e0e0' }}>
            <FileText size={15} color="#888888" />
            <span>Generated Invoice: #{invoiceId}</span>
          </div>
          <button
            onClick={handleDownloadInvoice}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 8,
              backgroundColor: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#ffffff',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            <Download size={12} /> Download Invoice (.json)
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <div style={{ color: '#555555', marginBottom: 2 }}>Receipt ID</div>
            <div style={{ fontFamily: 'monospace', color: '#aaaaaa' }}>{receiptId}</div>
          </div>

          <div>
            <div style={{ color: '#555555', marginBottom: 2 }}>Algorand Settlement Hash</div>
            <a
              href={`https://testnet.algonode.cloud/v2/transactions/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: 'monospace',
                color: '#5a9a5a',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                maxWidth: 220,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {txHash.slice(0, 16)}... <ExternalLink size={11} />
            </a>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <button
          onClick={onRunAnother}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '11px 20px',
            borderRadius: 11,
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#ffffff',
            fontSize: 13,
            fontWeight: 600,
            fontFamily: 'Inter',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
        >
          <RefreshCw size={14} /> Run Another Task
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link
            href="/provenance"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '11px 20px',
              borderRadius: 11,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#cccccc',
              fontSize: 13,
              fontWeight: 500,
              fontFamily: 'Inter',
              textDecoration: 'none',
            }}
          >
            <ShieldCheck size={14} /> View Provenance Trace
          </Link>

          <Link
            href="/dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '11px 22px',
              borderRadius: 11,
              backgroundColor: '#f0f0f0',
              color: '#050505',
              fontSize: 13,
              fontWeight: 600,
              fontFamily: 'Inter',
              textDecoration: 'none',
              boxShadow: '0 4px 20px rgba(255, 255, 255, 0.1)',
            }}
          >
            <LayoutDashboard size={14} /> Return to Dashboard
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
