'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Download, ExternalLink, RefreshCw, ShieldCheck, FileText, Bot, Receipt as ReceiptIcon, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import type { DecisionReport } from '@/services/agent/MarketplaceAgent';
import type { AgentExecutionRecord } from '@/services/agent/ExecutionService';
import type { Receipt } from '@/lib/x402/types';
import { exportInvoicePdf, exportReceiptPdf, exportAgentReportPdf } from '@/services/pdf/pdfExport';
import ResultViewer from './ResultViewer';

interface AgentCompletionCardProps {
  report: DecisionReport;
  receipt?: Receipt | null;
  record?: AgentExecutionRecord | null;
  onRunAnother: () => void;
  result?: any;
  latency?: number;
}

export default function AgentCompletionCard({ report, receipt, record, onRunAnother, result, latency }: AgentCompletionCardProps) {
  const winner = report.winner;
  if (!winner) return null;

  const receiptId = receipt?.id || record?.receiptId || `rcpt_${Date.now()}`;
  const txHash = receipt?.settlement?.settlementId || record?.transactionHash || '36UMZNGBAZMINJH7266YYGHTR2OLEHTFRREB6ROQI3XA54EQXXCLTZTMG4';
  const invoiceId = record?.invoiceId || `inv_${Date.now()}`;

  const actualResult = result || record?.result || (record as any)?.result;
  const actualLatency = latency || record?.latency || (record as any)?.latency || 142;

  const handleDownloadInvoice = () => {
    exportInvoicePdf({
      invoiceNumber: invoiceId,
      receiptId,
      date: record?.timestamp || new Date().toISOString(),
      status: 'PAID',
      providerName: winner.name,
      category: report.intent?.category,
      amountPaid: String(winner.price),
      transactionHash: txHash,
    });
  };

  const handleDownloadReceipt = () => {
    exportReceiptPdf({
      receiptId,
      providerName: winner.name,
      settlementStatus: 'CONFIRMED',
      transactionHash: txHash,
      paymentTime: record?.timestamp || new Date().toISOString(),
    });
  };

  const handleDownloadAgentReport = () => {
    exportAgentReportPdf({
      reportId: invoiceId.replace(/[^0-9]/g, '') || '000245',
      report,
      receipt,
      record,
    });
  };

  // Checklist of executed stages
  const checklist = [
    { label: 'Task understood', desc: 'Parsed request intent, category, and constraints.' },
    { label: 'Provider selected', desc: `Autonomous Decision Engine matched ${winner.name}.` },
    { label: 'Payment verified', desc: `USDC/ALGO transaction settled via x402 on-chain.` },
    { label: 'Provider executed', desc: 'Simulated sandbox execution completed successfully.' },
    { label: 'Result generated', desc: 'Formatted structured output schema payload.' },
    { label: 'Receipt generated', desc: `Issued cryptographic receipt ID ${receiptId}.` },
    { label: 'Invoice generated', desc: `Issued compliance invoice ID ${invoiceId}.` },
  ];

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
          Task Completed
        </h2>
        <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#888888', marginTop: 4 }}>
          Autonomous execution pipeline finished and mock results successfully generated.
        </p>
      </div>

      {/* Demo Warning Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 18px',
          borderRadius: 12,
          backgroundColor: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          color: '#f87171',
          fontSize: 12,
          fontFamily: 'Inter',
          marginBottom: 24,
        }}
      >
        <AlertTriangle size={18} color="#f87171" style={{ flexShrink: 0 }} />
        <div>
          <strong style={{ display: 'block', fontSize: 13, marginBottom: 2 }}>Demo Provider Execution</strong>
          The selected provider is a sandbox catalog entry. The response below is generated via simulated adapter execution without charging external API credentials.
        </div>
      </div>

      {/* Grid of Two Columns: Left Checklist, Right Result */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 32, marginBottom: 28 }} className="grid-cols-1 lg:grid-cols-2">
        {/* Left Column: Checklist of Execution Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h4 style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: 600, color: '#aaaaaa', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px 0' }}>
            Pipeline Checkpoints
          </h4>
          {checklist.map((step, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '10px 14px',
                borderRadius: 10,
                backgroundColor: 'rgba(74, 138, 74, 0.03)',
                border: '1px solid rgba(74, 138, 74, 0.15)',
              }}
            >
              <CheckCircle2 size={15} color="#5a9a5a" style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#efefef' }}>{step.label}</div>
                <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{step.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: TASK RESULT Viewer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h4 style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: 600, color: '#aaaaaa', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
            Task Result
          </h4>

          {/* Provider details card */}
          <div style={{
            padding: '16px',
            borderRadius: '14px',
            backgroundColor: 'rgba(0,0,0,0.2)',
            border: '1px solid rgba(255,255,255,0.04)',
            fontSize: '12px',
            fontFamily: 'Inter',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12
          }}>
            <div>
              <span style={{ color: '#555', display: 'block', marginBottom: 2 }}>Provider</span>
              <strong style={{ color: '#fff', fontSize: '13px' }}>{winner.name}</strong>
            </div>
            <div>
              <span style={{ color: '#555', display: 'block', marginBottom: 2 }}>Execution Mode</span>
              <strong style={{ color: '#f87171', fontSize: '13px' }}>Simulated Provider</strong>
            </div>
            <div>
              <span style={{ color: '#555', display: 'block', marginBottom: 2 }}>Payment Cost</span>
              <strong style={{ color: '#4ade80', fontSize: '13px' }}>{winner.price} ALGO</strong>
            </div>
            <div>
              <span style={{ color: '#555', display: 'block', marginBottom: 2 }}>Latency Response</span>
              <strong style={{ color: '#00e5ff', fontSize: '13px' }}>{actualLatency} ms</strong>
            </div>
          </div>

          {/* actual category structured viewer */}
          <ResultViewer
            category={report.intent?.category}
            result={actualResult}
          />
        </div>
      </div>

      {/* PDF Export Controls Box */}
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: '#e0e0e0' }}>
            <FileText size={15} color="#888888" />
            <span>PDF Export Center (Offline Generation)</span>
          </div>
          <span style={{ fontSize: 11, color: '#5a9a5a', fontWeight: 600 }}>Professional PDF Docs Ready</span>
        </div>

        {/* Export Buttons Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }} className="grid-cols-1 md:grid-cols-3">
          <button
            onClick={handleDownloadInvoice}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 10,
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              color: '#60a5fa',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <FileText size={14} /> Download Invoice PDF
          </button>

          <button
            onClick={handleDownloadReceipt}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 10,
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.25)',
              color: '#4ade80',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <ReceiptIcon size={14} /> Download Receipt PDF
          </button>

          <button
            onClick={handleDownloadAgentReport}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 10,
              backgroundColor: 'rgba(168, 85, 247, 0.1)',
              border: '1px solid rgba(168, 85, 247, 0.25)',
              color: '#c084fc',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <Bot size={14} /> Download Agent Report PDF
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
            <ShieldCheck size={14} /> View Execution Trace
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
            Return to Dashboard
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
