'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Copy, ExternalLink, FileText, Hash, ShieldCheck, Clock, DollarSign } from 'lucide-react';
import { Receipt } from '@/lib/receipts';

interface ReceiptCardProps {
  receipt: Receipt;
}

export default function ReceiptCard({ receipt }: ReceiptCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getStatusBadge = (status: Receipt['status']) => {
    if (status === 'settled') {
      return (
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: '3px 10px',
            borderRadius: 100,
            background: 'rgba(74,138,74,0.12)',
            color: '#5a9a5a',
            border: '1px solid rgba(74,138,74,0.25)',
            fontFamily: 'Inter',
          }}
        >
          ✓ Settled
        </span>
      );
    }
    if (status === 'pending') {
      return (
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: '3px 10px',
            borderRadius: 100,
            background: 'rgba(200,160,50,0.12)',
            color: '#c8a032',
            border: '1px solid rgba(200,160,50,0.25)',
            fontFamily: 'Inter',
          }}
        >
          ⏳ Pending
        </span>
      );
    }
    return (
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          padding: '3px 10px',
          borderRadius: 100,
          background: 'rgba(180,60,60,0.12)',
          color: '#c83c3c',
          border: '1px solid rgba(180,60,60,0.25)',
          fontFamily: 'Inter',
        }}
      >
        ✕ Failed
      </span>
    );
  };

  const truncatedWallet = receipt.wallet
    ? `${receipt.wallet.slice(0, 6)}...${receipt.wallet.slice(-4)}`
    : '0x0000...0000';

  const formattedDate = mounted ? new Date(receipt.timestamp).toLocaleString() : receipt.timestamp;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="card-hover"
      style={{
        borderRadius: 18,
        background: 'linear-gradient(155deg, rgba(20,20,24,0.95) 0%, rgba(12,12,14,0.95) 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        padding: '20px 24px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FileText size={16} color="#aaa" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 600, color: '#f0f0f0' }}>
                {receipt.receiptId}
              </span>
              <button
                onClick={() => copyToClipboard(receipt.receiptId, 'receiptId')}
                style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: 2 }}
                title="Copy Receipt ID"
              >
                {copiedField === 'receiptId' ? <Check size={12} color="#5a9a5a" /> : <Copy size={12} />}
              </button>
            </div>
            <div style={{ fontFamily: 'Inter', fontSize: 12, color: '#666', marginTop: 1 }}>
              {receipt.provider} {receipt.capability ? `· ${receipt.capability}` : ''}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'Inter', fontSize: 15, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em' }}>
              ${receipt.cost.toFixed(4)} USDC
            </div>
            <div style={{ fontFamily: 'Inter', fontSize: 11, color: '#555', marginTop: 1 }} suppressHydrationWarning>
              {formattedDate}
            </div>
          </div>
          {getStatusBadge(receipt.status)}
        </div>
      </div>

      {/* Details Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 12,
          padding: '14px 16px',
          borderRadius: 12,
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.04)',
        }}
        className="grid-cols-1 md:grid-cols-2"
      >
        {/* Wallet Address */}
        <div>
          <div style={{ fontSize: 11, color: '#555', fontFamily: 'Inter', marginBottom: 2 }}>Connected Wallet</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#cccccc' }}>{truncatedWallet}</span>
            <button
              onClick={() => copyToClipboard(receipt.wallet, 'wallet')}
              style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: 2 }}
              title="Copy Full Wallet"
            >
              {copiedField === 'wallet' ? <Check size={12} color="#5a9a5a" /> : <Copy size={12} />}
            </button>
          </div>
        </div>

        {/* Transaction Hash */}
        <div>
          <div style={{ fontSize: 11, color: '#555', fontFamily: 'Inter', marginBottom: 2 }}>Base Sepolia Transaction</div>
          {receipt.transactionHash ? (
            <a
              href={`https://sepolia.basescan.org/tx/${receipt.transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontFamily: 'monospace',
                fontSize: 12,
                color: '#80a5e5',
                textDecoration: 'none',
              }}
            >
              <span>
                {receipt.transactionHash.slice(0, 8)}...{receipt.transactionHash.slice(-6)}
              </span>
              <ExternalLink size={12} />
            </a>
          ) : (
            <span style={{ fontSize: 12, color: '#555', fontFamily: 'Inter' }}>None</span>
          )}
        </div>

        {/* Input SHA-256 Hash */}
        <div>
          <div style={{ fontSize: 11, color: '#555', fontFamily: 'Inter', marginBottom: 2 }}>Input SHA-256 Hash</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#a0a0a0', wordBreak: 'break-all' }}>
              {receipt.inputHash.slice(0, 12)}...{receipt.inputHash.slice(-8)}
            </span>
            <button
              onClick={() => copyToClipboard(receipt.inputHash, 'inputHash')}
              style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: 2 }}
              title="Copy Full Input Hash"
            >
              {copiedField === 'inputHash' ? <Check size={12} color="#5a9a5a" /> : <Copy size={12} />}
            </button>
          </div>
        </div>

        {/* Output SHA-256 Hash */}
        <div>
          <div style={{ fontSize: 11, color: '#555', fontFamily: 'Inter', marginBottom: 2 }}>Output SHA-256 Hash</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#a0a0a0', wordBreak: 'break-all' }}>
              {receipt.outputHash.slice(0, 12)}...{receipt.outputHash.slice(-8)}
            </span>
            <button
              onClick={() => copyToClipboard(receipt.outputHash, 'outputHash')}
              style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: 2 }}
              title="Copy Full Output Hash"
            >
              {copiedField === 'outputHash' ? <Check size={12} color="#5a9a5a" /> : <Copy size={12} />}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
