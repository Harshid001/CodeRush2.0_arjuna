'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, ShieldAlert, Zap, DollarSign, Server, CheckCircle2 } from 'lucide-react';

export interface CapItem {
  id: string;
  type: 'per_request' | 'per_provider_daily' | 'global_daily';
  title: string;
  subtitle: string;
  currentAmount: number;
  maxCap: number;
  unit: string;
  providerName?: string;
}

export const INITIAL_CAPS: CapItem[] = [
  {
    id: 'cap-req-1',
    type: 'per_request',
    title: 'Per-Request Cap',
    subtitle: 'Latest: GPT-4 Vision ($0.042)',
    currentAmount: 0.042,
    maxCap: 0.05,
    unit: '$',
  },
  {
    id: 'cap-prov-1',
    type: 'per_provider_daily',
    title: 'OpenCore Labs',
    subtitle: 'Per-provider daily cap',
    currentAmount: 3.20,
    maxCap: 5.00,
    unit: '$',
    providerName: 'OpenCore Labs',
  },
  {
    id: 'cap-prov-2',
    type: 'per_provider_daily',
    title: 'PixelForge AI',
    subtitle: 'Per-provider daily cap',
    currentAmount: 5.20,
    maxCap: 5.00,
    unit: '$',
    providerName: 'PixelForge AI',
  },
  {
    id: 'cap-global-1',
    type: 'global_daily',
    title: 'Global Daily Cap',
    subtitle: 'Across all agents today',
    currentAmount: 18.40,
    maxCap: 25.00,
    unit: '$',
  },
];

interface BudgetCapsProps {
  caps?: CapItem[];
}

export default function BudgetCaps({ caps = INITIAL_CAPS }: BudgetCapsProps) {
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  // Identify caps that exceed limit
  const exceededCaps = caps.filter((c) => c.currentAmount >= c.maxCap && !dismissedAlerts.includes(c.id));

  const getBarColor = (pct: number) => {
    if (pct >= 100) return '#c83c3c';
    if (pct >= 80) return '#c8a032';
    return '#80a5e5';
  };

  const getBarBg = (pct: number) => {
    if (pct >= 100) return 'rgba(180,60,60,0.12)';
    if (pct >= 80) return 'rgba(200,160,50,0.12)';
    return 'rgba(255,255,255,0.05)';
  };

  const getBadgeStyle = (pct: number) => {
    if (pct >= 100) {
      return {
        background: 'rgba(180,60,60,0.15)',
        color: '#c83c3c',
        border: '1px solid rgba(180,60,60,0.3)',
      };
    }
    if (pct >= 80) {
      return {
        background: 'rgba(200,160,50,0.15)',
        color: '#c8a032',
        border: '1px solid rgba(200,160,50,0.3)',
      };
    }
    return {
      background: 'rgba(74,138,74,0.12)',
      color: '#5a9a5a',
      border: '1px solid rgba(74,138,74,0.25)',
    };
  };

  return (
    <div style={{ width: '100%', marginBottom: 28 }}>
      {/* Alert Banner for Exceeded Caps */}
      <AnimatePresence>
        {exceededCaps.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            style={{ marginBottom: 20 }}
          >
            {exceededCaps.map((cap) => (
              <div
                key={cap.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  padding: '14px 20px',
                  borderRadius: 14,
                  background: 'rgba(180, 60, 60, 0.12)',
                  border: '1px solid rgba(180, 60, 60, 0.3)',
                  marginBottom: 10,
                  boxShadow: '0 4px 20px rgba(180,60,60,0.15)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: 'rgba(180, 60, 60, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <AlertTriangle size={18} color="#c83c3c" />
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: 600, color: '#f0f0f0' }}>
                      ⚠ Budget Cap Exceeded — {cap.title}
                    </div>
                    <div style={{ fontFamily: 'Inter', fontSize: 12, color: '#cccccc', marginTop: 1 }}>
                      Current spend ({cap.unit}{cap.currentAmount.toFixed(cap.type === 'per_request' ? 3 : 2)}) has reached 100% of maximum allowance ({cap.unit}{cap.maxCap.toFixed(cap.type === 'per_request' ? 3 : 2)}). Policy engine will reject subsequent calls under this rule.
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setDismissedAlerts([...dismissedAlerts, cap.id])}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#888888',
                    cursor: 'pointer',
                    padding: 6,
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#888888')}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4 Cards Grid */}
      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}
        className="grid-cols-1 md:grid-cols-2 xl:grid-cols-4"
      >
        {caps.map((cap, idx) => {
          const rawPct = (cap.currentAmount / cap.maxCap) * 100;
          const displayPct = Math.round(rawPct);
          const barColor = getBarColor(rawPct);
          const badgeStyle = getBadgeStyle(rawPct);

          const Icon =
            cap.type === 'per_request'
              ? Zap
              : cap.type === 'global_daily'
              ? DollarSign
              : Server;

          return (
            <motion.div
              key={cap.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.06 }}
              className="card-hover"
              style={{
                padding: '22px 20px',
                borderRadius: 18,
                background: 'linear-gradient(145deg, rgba(20,20,24,0.95) 0%, rgba(12,12,14,0.95) 100%)',
                border: rawPct >= 100 ? '1px solid rgba(180,60,60,0.35)' : '1px solid rgba(255,255,255,0.07)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Card Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 11,
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={16} color="#aaaaaa" />
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: 600, color: '#e0e0e0' }}>
                      {cap.title}
                    </div>
                    <div style={{ fontFamily: 'Inter', fontSize: 11, color: '#555555', marginTop: 1 }}>
                      {cap.subtitle}
                    </div>
                  </div>
                </div>

                <span
                  style={{
                    fontFamily: 'Inter',
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 100,
                    ...badgeStyle,
                  }}
                >
                  {displayPct}%
                </span>
              </div>

              {/* Numerical figures */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 12 }}>
                <span
                  style={{
                    fontFamily: 'Inter',
                    fontSize: 22,
                    fontWeight: 700,
                    color: rawPct >= 100 ? '#c83c3c' : '#ffffff',
                    letterSpacing: '-0.03em',
                  }}
                >
                  {cap.unit}
                  {cap.currentAmount.toFixed(cap.type === 'per_request' ? 3 : 2)}
                </span>
                <span style={{ fontFamily: 'Inter', fontSize: 12, color: '#555555' }}>
                  / {cap.unit}
                  {cap.maxCap.toFixed(cap.type === 'per_request' ? 3 : 2)} max
                </span>
              </div>

              {/* Progress Bar Container */}
              <div
                style={{
                  height: 6,
                  borderRadius: 3,
                  background: getBarBg(rawPct),
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, rawPct)}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  style={{
                    height: '100%',
                    borderRadius: 3,
                    background: barColor,
                    boxShadow: `0 0 10px ${barColor}80`,
                  }}
                />
              </div>

              {/* Status Note */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 11, fontFamily: 'Inter', color: '#444444' }}>
                <span>
                  {rawPct >= 100
                    ? '⛔ Cap Reached'
                    : rawPct >= 80
                    ? '⚠️ Approaching Cap'
                    : '✓ Within Allowance'}
                </span>
                <span>{cap.type === 'per_request' ? 'Per Request' : 'Resets 00:00 UTC'}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
