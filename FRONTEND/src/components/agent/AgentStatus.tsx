'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, RefreshCw } from 'lucide-react';

export type AgentErrorType =
  | 'NO_MATCHING_PROVIDER'
  | 'BUDGET_TOO_LOW'
  | 'NO_PROVIDER_PASSED_POLICY'
  | 'PAYMENT_CANCELLED'
  | 'PROVIDER_FAILURE';

interface AgentStatusProps {
  errorType?: AgentErrorType | string;
  errorMessage?: string;
  onReset: () => void;
  resetButtonText?: string;
}

const ERROR_CONFIGS: Record<string, { title: string; desc: string }> = {
  NO_MATCHING_PROVIDER: {
    title: 'No Matching Provider Discovered',
    desc: 'The agent could not locate an active provider in the marketplace matching your specified intent or category.',
  },
  BUDGET_TOO_LOW: {
    title: 'Budget Limit Exceeded',
    desc: 'The specified per-request budget is below the minimum price required by candidates in this category.',
  },
  NO_PROVIDER_PASSED_POLICY: {
    title: 'Policy Engine Rejection',
    desc: 'All candidate providers were blocked by your active security allowlist, daily spend limit, or quality threshold.',
  },
  PAYMENT_CANCELLED: {
    title: 'Payment Authorization Cancelled',
    desc: 'The transaction signature request or Lute Wallet session was cancelled by the user.',
  },
  PROVIDER_FAILURE: {
    title: 'Provider Node Execution Error',
    desc: 'The selected provider endpoint failed to return a valid output or cryptographic receipt signature.',
  },
};

export default function AgentStatus({ errorType = 'NO_PROVIDER_PASSED_POLICY', errorMessage, onReset, resetButtonText }: AgentStatusProps) {
  const config = ERROR_CONFIGS[errorType] || {
    title: 'Agent Execution Error',
    desc: errorMessage || 'An unexpected error occurred during agent orchestration.',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      style={{
        borderRadius: 20,
        backgroundColor: 'rgba(14, 14, 16, 0.95)',
        border: '1px solid rgba(239, 68, 68, 0.25)',
        padding: '24px 28px',
        boxShadow: '0 4px 32px rgba(0, 0, 0, 0.5)',
        marginBottom: 32,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <ShieldAlert size={18} color="#ef4444" />
        </div>

        <div style={{ flex: 1 }}>
          <h4 style={{ fontFamily: 'Inter', fontSize: 15, fontWeight: 600, color: '#efefef', margin: 0 }}>
            {config.title}
          </h4>
          <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#888888', margin: '4px 0 14px', lineHeight: 1.5 }}>
            {errorMessage || config.desc}
          </p>

          <button
            onClick={onReset}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: 10,
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#cccccc',
              fontSize: 12,
              fontWeight: 500,
              fontFamily: 'Inter',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)')}
          >
            <RefreshCw size={13} />
            <span>{resetButtonText || 'Modify Prompt & Retry'}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
