'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, ZapOff, CheckCircle2 } from 'lucide-react';
import { useProviderStatus } from '@/lib/providerStatus';

export default function ProviderBreakToggle() {
  const { providerStatus, toggleProviderStatus } = useProviderStatus();
  const providerAIsDown = providerStatus['OpenCore Labs'] === 'down';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 14,
        padding: '12px 18px',
        borderRadius: 14,
        background: providerAIsDown ? 'rgba(180, 60, 60, 0.08)' : 'rgba(255, 255, 255, 0.02)',
        border: providerAIsDown
          ? '1px dashed rgba(200, 60, 60, 0.5)'
          : '1px dashed rgba(255, 255, 255, 0.12)',
        boxShadow: providerAIsDown ? '0 0 20px rgba(180,60,60,0.15)' : 'none',
        transition: 'all 0.3s ease',
        marginBottom: 20,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: providerAIsDown ? 'rgba(180,60,60,0.2)' : 'rgba(255,255,255,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {providerAIsDown ? (
            <ZapOff size={16} color="#c83c3c" />
          ) : (
            <AlertTriangle size={16} color="#c8a032" />
          )}
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: 600, color: '#f0f0f0' }}>
              Debug Tool: Provider Outage Simulation
            </span>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: 10,
                padding: '2px 7px',
                borderRadius: 4,
                background: providerAIsDown ? 'rgba(180,60,60,0.25)' : 'rgba(74,138,74,0.15)',
                color: providerAIsDown ? '#c83c3c' : '#5a9a5a',
                border: `1px solid ${providerAIsDown ? 'rgba(180,60,60,0.3)' : 'rgba(74,138,74,0.3)'}`,
              }}
            >
              {providerAIsDown ? '🔴 Provider A: DOWN (Simulated)' : '🟢 Provider A: HEALTHY'}
            </span>
          </div>
          <p style={{ fontFamily: 'Inter', fontSize: 11, color: '#777777', marginTop: 2 }}>
            Simulate HTTP 500 failure on OpenCore Labs to demonstrate automatic fallback to Provider B (AudioAI Systems) with zero double-spend.
          </p>
        </div>
      </div>

      <button
        onClick={() => toggleProviderStatus('OpenCore Labs')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 14px',
          borderRadius: 10,
          border: `1px solid ${providerAIsDown ? 'rgba(180,60,60,0.4)' : 'rgba(200,160,50,0.4)'}`,
          background: providerAIsDown ? 'rgba(180,60,60,0.2)' : 'rgba(200,160,50,0.15)',
          color: providerAIsDown ? '#ffffff' : '#f0c040',
          fontFamily: 'Inter',
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        <RefreshCw size={12} className={providerAIsDown ? 'animate-spin-slow' : ''} />
        {providerAIsDown ? 'Restore Provider A (Healthy)' : '⚠ Break Provider A'}
      </button>
    </div>
  );
}
