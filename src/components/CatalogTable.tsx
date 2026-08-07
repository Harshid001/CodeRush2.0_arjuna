'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface CatalogItem {
  id: string;
  name: string;
  provider: string;
  capability?: string;
  price: string;
  qualityScore: number;
  rawDescription: string;
  cat: string;
  chain: string;
}

interface CatalogTableProps {
  items: CatalogItem[];
  onPurchase?: (item: CatalogItem) => void;
}

export default function CatalogTable({ items, onPurchase }: CatalogTableProps) {
  const getScoreBadge = (score: number) => {
    let color = '#5a9a5a'; // green >95
    let bg = 'rgba(74,138,74,0.12)';
    let border = 'rgba(74,138,74,0.25)';

    if (score < 85) {
      color = '#c83c3c'; // red <85
      bg = 'rgba(180,60,60,0.12)';
      border = 'rgba(180,60,60,0.25)';
    } else if (score <= 95) {
      color = '#c8a032'; // amber 85-95
      bg = 'rgba(200,160,50,0.12)';
      border = 'rgba(200,160,50,0.25)';
    }

    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '3px 10px',
          borderRadius: 100,
          fontSize: 12,
          fontWeight: 600,
          fontFamily: 'Inter',
          color,
          background: bg,
          border: `1px solid ${border}`,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: color,
            boxShadow: `0 0 6px ${color}`,
          }}
        />
        {score.toFixed(1)}%
      </span>
    );
  };

  return (
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
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          textAlign: 'left',
          minWidth: 850,
        }}
      >
        <thead>
          <tr
            style={{
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.02)',
            }}
          >
            <th style={{ padding: '16px 20px', fontFamily: 'Inter', fontSize: 11, fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Provider Name
            </th>
            <th style={{ padding: '16px 20px', fontFamily: 'Inter', fontSize: 11, fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Capability
            </th>
            <th style={{ padding: '16px 20px', fontFamily: 'Inter', fontSize: 11, fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Price / Request
            </th>
            <th style={{ padding: '16px 20px', fontFamily: 'Inter', fontSize: 11, fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Quality Score
            </th>
            <th style={{ padding: '16px 20px', fontFamily: 'Inter', fontSize: 11, fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em', width: '32%' }}>
              Raw Description (Escaped)
            </th>
            <th style={{ padding: '16px 20px', fontFamily: 'Inter', fontSize: 11, fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'right' }}>
              Action
            </th>
          </tr>
        </thead>

        <tbody>
          {items.map((item, idx) => (
            <tr
              key={item.id}
              style={{
                borderBottom: idx < items.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.025)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              {/* Provider Name */}
              <td style={{ padding: '16px 20px', verticalAlign: 'top' }}>
                <div style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: 600, color: '#f0f0f0' }}>
                  {item.provider}
                </div>
                <div style={{ fontFamily: 'Inter', fontSize: 11, color: '#555555', marginTop: 2 }}>
                  {item.chain} · {item.cat}
                </div>
              </td>

              {/* Capability */}
              <td style={{ padding: '16px 20px', verticalAlign: 'top' }}>
                <div style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: 500, color: '#dddddd' }}>
                  {item.name}
                </div>
              </td>

              {/* Price / Request */}
              <td style={{ padding: '16px 20px', verticalAlign: 'top' }}>
                <div style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em' }}>
                  {item.price}
                </div>
              </td>

              {/* Quality Score */}
              <td style={{ padding: '16px 20px', verticalAlign: 'top' }}>
                {getScoreBadge(item.qualityScore)}
              </td>

              {/* Raw Description (Escaped Text) */}
              <td style={{ padding: '16px 20px', verticalAlign: 'top' }}>
                <div
                  style={{
                    maxHeight: 70,
                    overflowY: 'auto',
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    fontFamily: 'monospace',
                    fontSize: 11,
                    color: '#a0a0a0',
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                  title="Raw uninterpreted prompt payload"
                >
                  {String(item.rawDescription)}
                </div>
              </td>

              {/* Action */}
              <td style={{ padding: '16px 20px', verticalAlign: 'top', textAlign: 'right' }}>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onPurchase?.(item)}
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
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  }}
                >
                  Purchase
                </motion.button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {items.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#555', fontFamily: 'Inter' }}>
          No APIs match the current table filter.
        </div>
      )}
    </div>
  );
}
