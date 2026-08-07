'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, AlertTriangle, ShieldAlert, XCircle, RefreshCw } from 'lucide-react';

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
}

const ERROR_CONFIGS: Record<string, { title: string; desc: string; iconColor: string }> = {
  NO_MATCHING_PROVIDER: {
    title: 'No Matching Provider Discovered',
    desc: 'The agent could not locate an active provider in the marketplace matching your specified intent or category.',
    iconColor: '#f59e0b',
  },
  BUDGET_TOO_LOW: {
    title: 'Budget Limit Exceeded',
    desc: 'The specified per-request budget is below the minimum price required by candidates in this category.',
    iconColor: '#ef4444',
  },
  NO_PROVIDER_PASSED_POLICY: {
    title: 'Policy Engine Rejection',
    desc: 'All candidate providers were blocked by your active security allowlist, daily spend limit, or quality threshold.',
    iconColor: '#ef4444',
  },
  PAYMENT_CANCELLED: {
    title: 'Payment Authorization Cancelled',
    desc: 'The transaction signature request or Lute Wallet session was cancelled by the user.',
    iconColor: '#f59e0b',
  },
  PROVIDER_FAILURE: {
    title: 'Provider Node Execution Error',
    desc: 'The selected provider endpoint failed to return a valid output or cryptographic receipt signature.',
    iconColor: '#ef4444',
  },
};

export default function AgentStatus({ errorType = 'NO_PROVIDER_PASSED_POLICY', errorMessage, onReset }: AgentStatusProps) {
  const config = ERROR_CONFIGS[errorType] || {
    title: 'Agent Execution Error',
    desc: errorMessage || 'An unexpected error occurred during agent orchestration.',
    iconColor: '#ef4444',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      style={{
        borderRadius: 20,
        backgroundColor: 'rgba(20, 12, 14, 0.95)',
        border: `1px solid ${config.iconColor}50`,
        padding: '28px 32px',
        boxShadow: `0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px ${config.iconColor}20`,
        marginBottom: 32,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            backgroundColor: `${config.iconColor}15`,
            border: `1px solid ${config.iconColor}40`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <ShieldAlert size={24} color={config.iconColor} />
        </div>

        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: 18, fontWeight: 700, color: '#ffffff', margin: 0 }}>
            {config.title}
          </h4>
          <p style={{ fontSize: 13, color: '#aaaa88', margin: '6px 0 16px', lineHeight: 1.5 }}>
            {errorMessage || config.desc}
          </p>

          <button
            onClick={onReset}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 18px',
              borderRadius: 10,
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 600,
              fontFamily: 'Inter',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)')}
          >
            <RefreshCw size={14} />
            <span>Modify Prompt & Retry</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
