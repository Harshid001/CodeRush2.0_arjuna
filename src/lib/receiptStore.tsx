'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Receipt, generateHash } from './receipts';

interface ReceiptContextType {
  receipts: Receipt[];
  addReceipt: (receipt: Receipt) => void;
  createAndAddReceipt: (params: {
    provider: string;
    providerVersion?: string;
    capability: string;
    wallet: string;
    transactionHash: string;
    inputPayload: string;
    outputPayload: string;
    cost: number;
    status: 'settled' | 'pending' | 'failed';
  }) => Promise<Receipt>;
  getReceiptById: (id: string) => Receipt | undefined;
  exportReceiptsCSV: () => void;
  exportReceiptsJSON: () => void;
}

const ReceiptContext = createContext<ReceiptContextType | undefined>(undefined);

export const INITIAL_RECEIPTS: Receipt[] = [
  {
    receiptId: 'rcpt_8f92a101',
    provider: 'OpenCore Labs',
    providerVersion: 'v1.4.2',
    capability: 'GPT-4 Vision Pro Inference',
    wallet: 'NP6R27ETK85JALGO92KTESTNETSERVICENODEKEY10294857KYST6LO',
    transactionHash: '0x3f9a2b8c1e4d7f6a0c5b8e2d9f1a4c7e0b3d6f9a2c5e8b1d4f7a0c3e6b9d2f5',
    inputHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    outputHash: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
    inputPayload: JSON.stringify({ model: 'gpt-4-vision', prompt: 'Analyze medical chart image payload', max_tokens: 500 }, null, 2),
    outputPayload: JSON.stringify({ status: 200, analysis: 'Chart indicates 12% growth year over year', confidence: 0.98 }, null, 2),
    timestamp: '2026-08-07T12:24:10.000Z',
    cost: 0.0042,
    status: 'settled',
  },
  {
    receiptId: 'rcpt_7c81b209',
    provider: 'AudioAI Systems',
    providerVersion: 'v2.1.0',
    capability: 'Whisper Speech-to-Text',
    wallet: 'NP6R27ETK85JALGO92KTESTNETSERVICENODEKEY10294857KYST6LO',
    transactionHash: '0x81b7e2a4c90d1f3e5b6a7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8',
    inputHash: '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',
    outputHash: 'fc21b9b457a9769438a5775a2ef383d05832b68bdf8e98d4a6547a4658a5d252',
    inputPayload: JSON.stringify({ model: 'whisper-large-v3', audio_format: 'wav', sample_rate: 16000, duration_sec: 42 }, null, 2),
    outputPayload: JSON.stringify({ text: 'The agentic marketplace settles micropayments automatically via x402 on Algorand TestNet.', language: 'en' }, null, 2),
    timestamp: '2026-08-07T12:22:45.000Z',
    cost: 0.0018,
    status: 'settled',
  },
  {
    receiptId: 'rcpt_5b69d427',
    provider: 'VectorCore',
    providerVersion: 'v3.0.1',
    capability: 'EmbedForce v3 Semantic Search',
    wallet: '0x71C83B47c04E923a10F8721102910a9E23',
    transactionHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2',
    inputHash: '8f4e2a1b9c0d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f',
    outputHash: '7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b',
    inputPayload: JSON.stringify({ query: 'Semantic vector search query for autonomous AI policy engine rules', dimensions: 1536 }, null, 2),
    outputPayload: JSON.stringify({ status: 'pending', vector_count: 1536, indexing: true }, null, 2),
    timestamp: '2026-08-07T12:18:30.000Z',
    cost: 0.0003,
    status: 'pending',
  },
];

export function ReceiptProvider({ children }: { children: React.ReactNode }) {
  const [receipts, setReceipts] = useState<Receipt[]>(INITIAL_RECEIPTS);

  useEffect(() => {
    // Generate real Web Crypto SHA-256 hashes for initial mock items on load
    const initHashes = async () => {
      const updated = await Promise.all(
        INITIAL_RECEIPTS.map(async (r) => {
          const inHash = await generateHash(r.inputPayload || `INPUT_PAYLOAD_${r.provider}_${r.capability}_${r.timestamp}`);
          const outHash = await generateHash(r.outputPayload || `OUTPUT_RESPONSE_${r.provider}_${r.receiptId}`);
          return {
            ...r,
            inputHash: inHash,
            outputHash: outHash,
          };
        })
      );
      setReceipts(updated);
    };
    initHashes();
  }, []);

  const addReceipt = (receipt: Receipt) => {
    setReceipts((prev) => [receipt, ...prev]);
  };

  const createAndAddReceipt = async (params: {
    provider: string;
    providerVersion?: string;
    capability: string;
    wallet: string;
    transactionHash: string;
    inputPayload: string;
    outputPayload: string;
    cost: number;
    status: 'settled' | 'pending' | 'failed';
  }): Promise<Receipt> => {
    const inputHash = await generateHash(params.inputPayload);
    const outputHash = await generateHash(params.outputPayload);
    const receiptId = `rcpt_${Math.random().toString(36).slice(2, 10)}`;

    const newReceipt: Receipt = {
      receiptId,
      provider: params.provider,
      providerVersion: params.providerVersion || 'v1.0.0',
      capability: params.capability,
      wallet: params.wallet || '0x71C83B47c04E923a10F8721102910a9E23',
      transactionHash: params.transactionHash,
      inputHash,
      outputHash,
      inputPayload: params.inputPayload,
      outputPayload: params.outputPayload,
      timestamp: new Date().toISOString(),
      cost: params.cost,
      status: params.status,
    };

    setReceipts((prev) => [newReceipt, ...prev]);
    return newReceipt;
  };

  const getReceiptById = (id: string) => {
    return receipts.find((r) => r.receiptId === id);
  };

  const exportReceiptsCSV = () => {
    if (receipts.length === 0) return;
    const headers = ['Receipt ID', 'Provider', 'Version', 'Capability', 'Wallet', 'TX Hash', 'Input SHA256', 'Output SHA256', 'Cost (USDC)', 'Status', 'Timestamp'];
    const rows = receipts.map((r) => [
      r.receiptId,
      `"${r.provider}"`,
      `"${r.providerVersion || 'v1.0.0'}"`,
      `"${r.capability || ''}"`,
      r.wallet,
      r.transactionHash,
      r.inputHash,
      r.outputHash,
      r.cost,
      r.status,
      r.timestamp,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nexusapi_receipts_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportReceiptsJSON = () => {
    if (receipts.length === 0) return;
    const jsonContent = JSON.stringify(receipts, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nexusapi_receipts_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ReceiptContext.Provider
      value={{
        receipts,
        addReceipt,
        createAndAddReceipt,
        getReceiptById,
        exportReceiptsCSV,
        exportReceiptsJSON,
      }}
    >
      {children}
    </ReceiptContext.Provider>
  );
}

export function useReceipts() {
  const context = useContext(ReceiptContext);
  if (!context) {
    throw new Error('useReceipts must be used within a ReceiptProvider');
  }
  return context;
}
