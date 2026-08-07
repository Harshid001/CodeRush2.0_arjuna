'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Clock, Shield, Star, DollarSign, GitCompareArrows, Check } from 'lucide-react';
import { toast } from 'sonner';
import type { MarketplaceApi } from '@/lib/data/marketplaceApis';
import { useCompare } from '@/context/CompareContext';

interface PricingCardProps {
    api: MarketplaceApi;
}

export default function PricingCard({ api }: PricingCardProps) {
    const isUsageCap = api.model.toLowerCase().includes('cap');
    const router = useRouter();
    const { addToCompare, isInCompare } = useCompare();
    const alreadyAdded = isInCompare(api.id);

    const handleBuyApi = () => {
        router.push(`/agent-advisor?providerId=${api.id}&category=${encodeURIComponent(api.cat)}&task=${encodeURIComponent(api.name)}`);
    };

    const handleCompare = () => {
        if (alreadyAdded) {
            toast('Already in comparison list.');
            router.push('/compare');
            return;
        }
        const success = addToCompare(api);
        if (success) {
            toast.success(`${api.name} added to comparison.`);
            router.push('/compare');
        } else {
            toast.error('Compare list is full (max 3). Remove one first.');
        }
    };

    return (
        <div style={{
            borderRadius: 20,
            background: 'linear-gradient(155deg, rgba(22,22,26,0.95) 0%, rgba(12,12,14,0.95) 100%)',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
            padding: '28px',
            position: 'sticky',
            top: 100,
        }}>
            <h3 style={{
                fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.08em', color: '#555', marginBottom: 20
            }}>
                Pricing & Specs
            </h3>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 32, fontWeight: 700, color: '#e0e0e0', letterSpacing: '-0.02em' }}>
                    {api.price}
                </span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#666' }}>
                    {isUsageCap ? '/ month' : '/ request'}
                </span>
            </div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#444', marginBottom: 28 }}>
                Payment Type: {api.model} - Limit: {api.cap}
            </p>

            {/* Stats Table */}
            <div style={{
                background: 'rgba(255,255,255,0.02)', borderRadius: 14,
                border: '1px solid rgba(255,255,255,0.05)', padding: '16px', marginBottom: 32
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#888', fontFamily: 'Inter', fontSize: 13 }}>
                        <Star size={14} color="#666" /> Quality Score
                    </span>
                    <span style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: 600, color: '#5a9a5a' }}>
                        {api.qualityScore}% ({(api.qualityScore / 20).toFixed(1)}/5)
                    </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#888', fontFamily: 'Inter', fontSize: 13 }}>
                        <Clock size={14} color="#666" /> Avg Latency
                    </span>
                    <span style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: 500, color: '#ccc' }}>
                        {api.latency || 120}ms
                    </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#888', fontFamily: 'Inter', fontSize: 13 }}>
                        <Shield size={14} color="#666" /> Reliability
                    </span>
                    <span style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: 500, color: '#ccc' }}>
                        {api.reliability || 99.9}%
                    </span>
                </div>
            </div>

            <motion.button
                onClick={handleBuyApi}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                style={{
                    width: '100%', padding: '15px', borderRadius: 14,
                    background: '#efefef', color: '#050505',
                    fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600,
                    border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: 8, boxShadow: '0 8px 24px rgba(239,239,239,0.15)',
                    marginBottom: 12, transition: 'box-shadow 0.2s',
                }}
            >
                <DollarSign size={16} /> Buy API
            </motion.button>

            <motion.button
                onClick={handleCompare}
                whileHover={{ background: 'rgba(255,255,255,0.08)' }}
                style={{
                    width: '100%', padding: '14px', borderRadius: 14,
                    background: alreadyAdded ? 'rgba(90,154,90,0.12)' : 'rgba(255,255,255,0.04)',
                    color: alreadyAdded ? '#5a9a5a' : '#bbb',
                    fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500,
                    border: alreadyAdded ? '1px solid rgba(90,154,90,0.25)' : '1px solid rgba(255,255,255,0.08)',
                    cursor: 'pointer',
                    transition: 'background 0.2s, color 0.2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
            >
                {alreadyAdded ? <><Check size={14} /> View Comparison →</> : <><GitCompareArrows size={14} /> Compare</>}
            </motion.button>

            <p style={{
                marginTop: 20, textAlign: 'center', fontFamily: 'Inter',
                fontSize: 11, color: '#444', lineHeight: 1.5
            }}>
                Payments are trustlessly resolved overriding external billing tools using the underlying x402 scheme.
            </p>
        </div>
    );
}
