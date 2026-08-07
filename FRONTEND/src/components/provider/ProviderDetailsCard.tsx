'use client';

import React from 'react';
import { Lock, Network } from 'lucide-react';
import type { MarketplaceApi } from '@/lib/data/marketplaceApis';

interface ProviderDetailsCardProps {
    api: MarketplaceApi;
}

export default function ProviderDetailsCard({ api }: ProviderDetailsCardProps) {
    return (
        <div style={{
            borderRadius: 20,
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            padding: '32px',
            marginBottom: 24,
        }}>
            <h2 style={{
                fontFamily: 'Playfair Display, Georgia, serif',
                fontSize: 24, fontWeight: 600, color: '#efefef', marginBottom: 24
            }}>
                API Details
            </h2>
            <p style={{
                fontFamily: 'Inter', fontSize: 14, color: '#999',
                lineHeight: 1.7, marginBottom: 32
            }}>
                {api.desc}
            </p>

            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 24, marginBottom: 32
            }}>
                <div>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Inter', fontSize: 13, color: '#555', marginBottom: 12 }}>
                        <Network size={14} /> Network Setup
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: 8 }}>
                            <span style={{ fontFamily: 'Inter', fontSize: 13, color: '#777' }}>Network</span>
                            <span style={{ fontFamily: 'Inter', fontSize: 13, color: '#ddd' }}>{api.network || 'N/A'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: 8 }}>
                            <span style={{ fontFamily: 'Inter', fontSize: 13, color: '#777' }}>Endpoint</span>
                            <span style={{ fontFamily: 'Inter', fontSize: 13, color: '#5a9a5a' }}>{api.endpoint || 'Hidden'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontFamily: 'Inter', fontSize: 13, color: '#777' }}>Environment</span>
                            <span style={{ fontFamily: 'Inter', fontSize: 13, color: '#ddd' }}>Production</span>
                        </div>
                    </div>
                </div>

                <div>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Inter', fontSize: 13, color: '#555', marginBottom: 12 }}>
                        <Lock size={14} /> Security & Integration
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: 8 }}>
                            <span style={{ fontFamily: 'Inter', fontSize: 13, color: '#777' }}>Auth Type</span>
                            <span style={{ fontFamily: 'Inter', fontSize: 13, color: '#ddd' }}>{api.authType || 'API Key'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: 8 }}>
                            <span style={{ fontFamily: 'Inter', fontSize: 13, color: '#777' }}>Supported Methods</span>
                            <span style={{ fontFamily: 'Inter', fontSize: 13, color: '#ddd' }}>
                                {api.supportedMethods ? api.supportedMethods.join(', ') : 'POST'}
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontFamily: 'Inter', fontSize: 13, color: '#777' }}>Rate Limit (per min)</span>
                            <span style={{ fontFamily: 'Inter', fontSize: 13, color: '#ddd' }}>
                                {api.rateLimit?.toLocaleString() || 'Custom'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <h4 style={{ fontFamily: 'Inter', fontSize: 13, color: '#555', marginBottom: 12 }}>
                    Capabilities (Tags)
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {(api.tags || [api.cat]).map(tag => (
                        <span key={tag} style={{
                            padding: '6px 14px', borderRadius: 100,
                            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                            fontFamily: 'Inter', fontSize: 11, color: '#999'
                        }}>
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

        </div>
    );
}
