'use client';

import React from 'react';
import Link from 'next/link';
import { Bot, ShoppingCart, ShieldCheck } from 'lucide-react';

interface ModeSelectorProps {
  currentMode: 'manual' | 'agent';
}

export default function ModeSelector({ currentMode }: ModeSelectorProps) {
  return (
    <div style={{ marginBottom: 36, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
      {/* Mode Switcher Segmented Control */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: 5,
          borderRadius: 14,
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <Link
          href="/marketplace"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 18px',
            borderRadius: 10,
            backgroundColor: currentMode === 'manual' ? 'rgba(255, 255, 255, 0.09)' : 'transparent',
            border: currentMode === 'manual' ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid transparent',
            color: currentMode === 'manual' ? '#ffffff' : '#666677',
            fontSize: 13,
            fontWeight: 600,
            fontFamily: 'Inter, sans-serif',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
          }}
        >
          <ShoppingCart size={14} color={currentMode === 'manual' ? '#ffffff' : '#666677'} />
          <span>Manual Marketplace</span>
        </Link>

        <Link
          href="/agent"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 18px',
            borderRadius: 10,
            backgroundColor: currentMode === 'agent' ? 'rgba(255, 255, 255, 0.09)' : 'transparent',
            border: currentMode === 'agent' ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid transparent',
            color: currentMode === 'agent' ? '#ffffff' : '#666677',
            fontSize: 13,
            fontWeight: 600,
            fontFamily: 'Inter, sans-serif',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
          }}
        >
          <Bot size={14} color={currentMode === 'agent' ? '#ffffff' : '#666677'} />
          <span>AI Marketplace Agent (Autonomous)</span>
        </Link>
      </div>

      {/* Engine Status Tag */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontFamily: 'Inter, sans-serif', color: '#5a9a5a' }}>
        <ShieldCheck size={14} color="#5a9a5a" />
        <span>x402 Policy & Decision Engine Active</span>
      </div>
    </div>
  );
}
