'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ShieldCheck, Check, Copy, ExternalLink, RefreshCw, X,
  FileCode, Layers, ShieldAlert, Cpu, CheckCircle2, AlertCircle, Loader2
} from 'lucide-react';
import { useReceipts } from '@/lib/receiptStore';
import { Receipt, generateHash } from '@/lib/receipts';

export default function ProvenanceViewer() {
  const { receipts } = useReceipts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Live Verification State inside Inspection Modal
  const [inputPayloadEdit, setInputPayloadEdit] = useState('');
  const [outputPayloadEdit, setOutputPayloadEdit] = useState('');
  const [verificationResult, setVerificationResult] = useState<{
    inputMatch: boolean;
    outputMatch: boolean;
    computedInputHash: string;
    computedOutputHash: string;
    tested: boolean;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(fieldName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const filteredReceipts = receipts.filter(
    (r) =>
      r.receiptId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.capability && r.capability.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleInspect = (r: Receipt) => {
    setSelectedReceipt(r);
    setInputPayloadEdit(
      r.inputPayload || JSON.stringify({ provider: r.provider, capability: r.capability, timestamp: r.timestamp }, null, 2)
    );
    setOutputPayloadEdit(
      r.outputPayload || JSON.stringify({ status: r.status, cost: r.cost, hash: r.outputHash }, null, 2)
    );
    setVerificationResult(null);
  };

  const handleVerifyHashes = async () => {
    if (!selectedReceipt) return;
    setIsVerifying(true);

    try {
      const computedInHash = await generateHash(inputPayloadEdit);
      const computedOutHash = await generateHash(outputPayloadEdit);

      const inMatch = computedInHash.toLowerCase() === selectedReceipt.inputHash.toLowerCase();
      const outMatch = computedOutHash.toLowerCase() === selectedReceipt.outputHash.toLowerCase();

      setVerificationResult({
        inputMatch: inMatch,
        outputMatch: outMatch,
        computedInputHash: computedInHash,
        computedOutputHash: computedOutHash,
        tested: true,
      });
    } catch (err) {
      console.error('Verification error:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Top Search & Filter Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 28,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '14px 20px',
            borderRadius: 16,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 2px 24px rgba(0,0,0,0.3)',
            flex: 1,
            maxWidth: 540,
          }}
        >
          <Search size={17} color="#555" style={{ flexShrink: 0 }} />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            type="text"
            placeholder="Search provenance records by Receipt ID or Provider name…"
            style={{ flex: 1, border: 'none', fontSize: 14, background: 'transparent', color: '#e0e0e0', fontFamily: 'Inter' }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{ fontFamily: 'Inter', fontSize: 12, color: '#555', background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 7, padding: '4px 10px', cursor: 'pointer' }}
            >
              Clear
            </button>
          )}
        </div>

        <div style={{ fontSize: 13, color: '#666', fontFamily: 'Inter' }}>
          Showing <strong style={{ color: '#ccc' }}>{filteredReceipts.length}</strong> verified chain-of-custody records
        </div>
      </div>

      {/* Provenance Table */}
      <div
        style={{
          width: '100%',
          overflowX: 'auto',
          borderRadius: 20,
          border: '1px solid rgba(255,255,255,0.07)',
          background: 'linear-gradient(155deg, rgba(20,20,24,0.95) 0%, rgba(12,12,14,0.95) 100%)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 900 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '16px 20px', fontFamily: 'Inter', fontSize: 11, fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Receipt ID
              </th>
              <th style={{ padding: '16px 20px', fontFamily: 'Inter', fontSize: 11, fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Provider & Version
              </th>
              <th style={{ padding: '16px 20px', fontFamily: 'Inter', fontSize: 11, fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Input SHA-256
              </th>
              <th style={{ padding: '16px 20px', fontFamily: 'Inter', fontSize: 11, fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Output SHA-256
              </th>
              <th style={{ padding: '16px 20px', fontFamily: 'Inter', fontSize: 11, fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Cost / Status
              </th>
              <th style={{ padding: '16px 20px', fontFamily: 'Inter', fontSize: 11, fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'right' }}>
                Replay Action
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredReceipts.map((r, idx) => (
              <tr
                key={r.receiptId}
                style={{
                  borderBottom: idx < filteredReceipts.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  transition: 'background 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Receipt ID */}
                <td style={{ padding: '16px 20px', verticalAlign: 'top' }}>
                  <div style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 600, color: '#f0f0f0' }}>
                    {r.receiptId}
                  </div>
                  <div style={{ fontSize: 11, color: '#555', fontFamily: 'Inter', marginTop: 2 }} suppressHydrationWarning>
                    {mounted ? new Date(r.timestamp).toLocaleTimeString() : r.timestamp}
                  </div>
                </td>

                {/* Provider + Version */}
                <td style={{ padding: '16px 20px', verticalAlign: 'top' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: 600, color: '#dddddd' }}>
                      {r.provider}
                    </span>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontSize: 10,
                        padding: '2px 6px',
                        borderRadius: 6,
                        background: 'rgba(255,255,255,0.06)',
                        color: '#888',
                      }}
                    >
                      {r.providerVersion || 'v1.2.0'}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: '#555', fontFamily: 'Inter', marginTop: 2 }}>
                    {r.capability || 'API Call'}
                  </div>
                </td>

                {/* Input Hash */}
                <td style={{ padding: '16px 20px', verticalAlign: 'top' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#a0a0a0' }}>
                      {r.inputHash.slice(0, 10)}...{r.inputHash.slice(-6)}
                    </span>
                    <button
                      onClick={() => copyToClipboard(r.inputHash, `in-${r.receiptId}`)}
                      style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', padding: 2 }}
                    >
                      {copiedKey === `in-${r.receiptId}` ? <Check size={11} color="#5a9a5a" /> : <Copy size={11} />}
                    </button>
                  </div>
                </td>

                {/* Output Hash */}
                <td style={{ padding: '16px 20px', verticalAlign: 'top' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#a0a0a0' }}>
                      {r.outputHash.slice(0, 10)}...{r.outputHash.slice(-6)}
                    </span>
                    <button
                      onClick={() => copyToClipboard(r.outputHash, `out-${r.receiptId}`)}
                      style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', padding: 2 }}
                    >
                      {copiedKey === `out-${r.receiptId}` ? <Check size={11} color="#5a9a5a" /> : <Copy size={11} />}
                    </button>
                  </div>
                </td>

                {/* Cost / Status */}
                <td style={{ padding: '16px 20px', verticalAlign: 'top' }}>
                  <div style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: 700, color: '#ffffff' }}>
                    ${r.cost.toFixed(4)} USDC
                  </div>
                  <span
                    style={{
                      display: 'inline-block',
                      marginTop: 2,
                      fontSize: 10,
                      fontWeight: 600,
                      color: r.status === 'settled' ? '#5a9a5a' : r.status === 'pending' ? '#c8a032' : '#c83c3c',
                    }}
                  >
                    ● {r.status.toUpperCase()}
                  </span>
                </td>

                {/* Inspect Action */}
                <td style={{ padding: '16px 20px', verticalAlign: 'top', textAlign: 'right' }}>
                  <button
                    onClick={() => handleInspect(r)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 10,
                      border: '1px solid rgba(255,255,255,0.12)',
                      background: 'rgba(255,255,255,0.06)',
                      color: '#ffffff',
                      fontFamily: 'Inter',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                  >
                    <ShieldCheck size={13} color="#80a5e5" /> Inspect & Replay
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredReceipts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '64px 0', color: '#555', fontFamily: 'Inter' }}>
            No provenance records match your search.
          </div>
        )}
      </div>

      {/* INSPECT & REPLAY MODAL */}
      <AnimatePresence>
        {selectedReceipt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedReceipt(null)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 200,
              background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(16px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
            }}
          >
            <motion.div
              initial={{ scale: 0.94, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 16 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: 720,
                maxHeight: '90vh',
                overflowY: 'auto',
                borderRadius: 22,
                background: '#0d0d0f',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
                padding: 28,
              }}
            >
              {/* Modal Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(80,120,255,0.12)', border: '1px solid rgba(80,120,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldCheck size={18} color="#80a5e5" />
                  </div>
                  <div>
                    <h3 style={{ fontFamily: 'Inter', fontSize: 16, fontWeight: 700, color: '#f0f0f0' }}>
                      Provenance Chain Audit & Replay
                    </h3>
                    <p style={{ fontFamily: 'monospace', fontSize: 12, color: '#888' }}>
                      ID: {selectedReceipt.receiptId} · Version: {selectedReceipt.providerVersion || 'v1.2.0'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedReceipt(null)}
                  style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: 6 }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Basic Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '14px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 11, color: '#555', fontFamily: 'Inter' }}>Provider & Capability</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#eee', fontFamily: 'Inter', marginTop: 2 }}>
                    {selectedReceipt.provider} ({selectedReceipt.capability || 'API'})
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#555', fontFamily: 'Inter' }}>Settled Cost</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', fontFamily: 'Inter', marginTop: 2 }}>
                    ${selectedReceipt.cost.toFixed(4)} USDC
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#555', fontFamily: 'Inter' }}>Signer Address</div>
                  <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#aaa', marginTop: 2 }}>
                    {selectedReceipt.wallet}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#555', fontFamily: 'Inter' }}>Base Sepolia Transaction</div>
                  {selectedReceipt.transactionHash ? (
                    <a
                      href={`https://sepolia.basescan.org/tx/${selectedReceipt.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: 11, fontFamily: 'monospace', color: '#80a5e5', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}
                    >
                      {selectedReceipt.transactionHash.slice(0, 10)}... <ExternalLink size={10} />
                    </a>
                  ) : (
                    <span style={{ fontSize: 11, color: '#555' }}>None</span>
                  )}
                </div>
              </div>

              {/* Interactive Payloads & Re-Hash Section */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#ddd', fontFamily: 'Inter' }}>
                    Payload Data Integrity Inspection (Web Crypto SHA-256)
                  </span>
                  <button
                    onClick={handleVerifyHashes}
                    disabled={isVerifying}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '7px 14px',
                      borderRadius: 10,
                      border: '1px solid rgba(74,138,74,0.4)',
                      background: 'rgba(74,138,74,0.15)',
                      color: '#5a9a5a',
                      fontFamily: 'Inter',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {isVerifying ? <Loader2 size={13} className="animate-spin-slow" /> : <RefreshCw size={13} />}
                    Verify Hash Live
                  </button>
                </div>

                {/* Verification Result Banner */}
                {verificationResult && verificationResult.tested && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 12,
                      background: verificationResult.inputMatch && verificationResult.outputMatch ? 'rgba(74,138,74,0.12)' : 'rgba(180,60,60,0.12)',
                      border: `1px solid ${verificationResult.inputMatch && verificationResult.outputMatch ? 'rgba(74,138,74,0.3)' : 'rgba(180,60,60,0.3)'}`,
                      marginBottom: 16,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    {verificationResult.inputMatch && verificationResult.outputMatch ? (
                      <>
                        <CheckCircle2 size={18} color="#5a9a5a" />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#ffffff', fontFamily: 'Inter' }}>
                            ✓ Hash Matches — Data Integrity Verified
                          </div>
                          <div style={{ fontSize: 11, color: '#5a9a5a', fontFamily: 'Inter', marginTop: 1 }}>
                            Live re-hashed Web Crypto SHA-256 output matches stored receipt record exactly. Zero payload tampering detected.
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertCircle size={18} color="#c83c3c" />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#ffffff', fontFamily: 'Inter' }}>
                            ❌ Hash Mismatch Detected — Data Modified!
                          </div>
                          <div style={{ fontSize: 11, color: '#c83c3c', fontFamily: 'Inter', marginTop: 1 }}>
                            The modified payload string produces a different SHA-256 hash than the on-chain recorded receipt.
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {/* Input Payload */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: '#888', fontFamily: 'Inter' }}>Raw Input Payload String</span>
                    <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#666' }}>Stored Hash: {selectedReceipt.inputHash.slice(0, 16)}...</span>
                  </div>
                  <textarea
                    value={inputPayloadEdit}
                    onChange={(e) => {
                      setInputPayloadEdit(e.target.value);
                      setVerificationResult(null);
                    }}
                    rows={4}
                    style={{
                      width: '100%',
                      padding: 12,
                      borderRadius: 10,
                      background: 'rgba(0,0,0,0.4)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#a0a0a0',
                      fontFamily: 'monospace',
                      fontSize: 11,
                      lineHeight: 1.5,
                      resize: 'vertical',
                    }}
                  />
                </div>

                {/* Output Payload */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: '#888', fontFamily: 'Inter' }}>Raw Output Response String</span>
                    <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#666' }}>Stored Hash: {selectedReceipt.outputHash.slice(0, 16)}...</span>
                  </div>
                  <textarea
                    value={outputPayloadEdit}
                    onChange={(e) => {
                      setOutputPayloadEdit(e.target.value);
                      setVerificationResult(null);
                    }}
                    rows={4}
                    style={{
                      width: '100%',
                      padding: 12,
                      borderRadius: 10,
                      background: 'rgba(0,0,0,0.4)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#a0a0a0',
                      fontFamily: 'monospace',
                      fontSize: 11,
                      lineHeight: 1.5,
                      resize: 'vertical',
                    }}
                  />
                </div>
              </div>

              {/* Close Action */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  style={{
                    padding: '9px 20px',
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.06)',
                    color: '#ccc',
                    fontFamily: 'Inter',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Close Inspection
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
