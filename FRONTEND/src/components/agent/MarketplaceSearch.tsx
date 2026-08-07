'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Database, Star, Clock } from 'lucide-react';
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
        backgroundColor: 'rgba(14, 14, 16, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.07)',
        padding: '24px 28px',
        marginBottom: 32,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Database size={16} color="#888888" />
          <h4 style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: 600, color: '#e0e0e0', margin: 0 }}>
            Marketplace Discovery ({candidates.length} Candidate Providers)
          </h4>
        </div>
        <span
          style={{
            fontFamily: 'Inter',
            fontSize: 11,
            padding: '3px 10px',
            borderRadius: 100,
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#888888',
            fontWeight: 500,
          }}
        >
          Category: {category}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
        {candidates.map((api) => (
          <div
            key={api.id}
            style={{
              padding: 16,
              borderRadius: 14,
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 10,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: 600, color: '#e0e0e0' }}>{api.name}</div>
                <div style={{ fontFamily: 'Inter', fontSize: 11, color: '#555555', marginTop: 2 }}>{api.provider || 'Verified Node'}</div>
              </div>
              <span style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 600, color: '#cccccc' }}>
                {api.price}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, fontFamily: 'Inter', color: '#888888' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#5a9a5a' }}>
                <Star size={11} fill="#5a9a5a" color="#5a9a5a" />
                <span>{api.qualityScore || 90}% Quality</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={11} color="#666666" />
                <span>{api.latency || 120}ms</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
