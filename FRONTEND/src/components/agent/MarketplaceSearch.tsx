'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Database, Star, Zap, Clock, ShieldCheck } from 'lucide-react';
import type { MarketplaceApi } from '@/lib/data/marketplaceApis';

interface MarketplaceSearchProps {
  candidates: MarketplaceApi[];
  category: string;
}

export default function MarketplaceSearch({ candidates, category }: MarketplaceSearchProps) {
  if (candidates.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        borderRadius: 20,
        backgroundColor: 'rgba(15, 15, 20, 0.85)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '24px 28px',
        marginBottom: 32,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Database size={18} color="#00e5ff" />
          <h4 style={{ fontSize: 15, fontWeight: 700, color: '#ffffff', margin: 0 }}>
            Marketplace Discovery ({candidates.length} Providers Found)
          </h4>
        </div>
        <span
          style={{
            fontSize: 11,
            padding: '3px 10px',
            borderRadius: 999,
            backgroundColor: 'rgba(0, 229, 255, 0.1)',
            border: '1px solid rgba(0, 229, 255, 0.25)',
            color: '#00e5ff',
            fontWeight: 600,
          }}
        >
          Category: {category}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
        {candidates.map((api) => (
          <div
            key={api.id}
            style={{
              padding: 16,
              borderRadius: 14,
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 10,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>{api.name}</div>
                <div style={{ fontSize: 11, color: '#888899', marginTop: 2 }}>{api.provider || 'Enterprise Node'}</div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#00e5ff', fontFamily: 'monospace' }}>
                {api.price}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: '#aaaabb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#fbbf24' }}>
                <Star size={12} fill="#fbbf24" />
                <span>{api.qualityScore || 90}% Quality</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={12} color="#888899" />
                <span>{api.latency || 120}ms</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
