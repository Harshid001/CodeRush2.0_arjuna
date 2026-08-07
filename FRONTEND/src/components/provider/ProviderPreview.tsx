'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Zap, Clock, Shield, Activity } from 'lucide-react';

interface PreviewData {
    providerName?: string;
    companyName?: string;
    description?: string;
    category?: string;
    pricePerRequest?: number;
    paymentType?: 'exact' | 'upto';
    qualityScore?: number;
    reliability?: number;
    avgLatency?: number;
    rateLimit?: number;
    network?: string;
    tags?: string[];
    version?: string;
}

interface ProviderPreviewProps {
    data: PreviewData;
}

export default function ProviderPreview({ data }: ProviderPreviewProps) {
    const name = data.providerName || 'Your API Name';
    const company = data.companyName || 'Your Company';
    const desc = data.description || 'Describe your API — this preview updates as you type.';
    const price = data.pricePerRequest || 0;
    const quality = data.qualityScore ?? 0;
    const reliability = data.reliability ?? 0;
    const latency = data.avgLatency ?? 0;
    const rateLimit = data.rateLimit ?? 0;
    const network = data.network || 'base-sepolia';
    const payment = data.paymentType || 'exact';
    const tags = data.tags || [];
    const category = data.category || 'LLM & NLP';

    return (
        <div>
            <p style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#444',
                marginBottom: 12,
            }}>
                Live Preview
            </p>

            {/* ── Card: mirrors ApiCard from marketplace/page.tsx exactly ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="card-hover"
                style={{
                    borderRadius: 20,
                    overflow: 'hidden',
                    position: 'relative',
                    background: 'linear-gradient(155deg, rgba(22,22,26,0.95) 0%, rgba(12,12,14,0.95) 100%)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    boxShadow: '0 4px 32px rgba(0,0,0,0.5)',
                }}
            >
                <div style={{ padding: '24px 22px' }}>
                    {/* header */}
                    <div style={{ display: 'flex', gap: 13, alignItems: 'flex-start', marginBottom: 16 }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: 12,
                            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                            <Zap size={18} color="#888" />
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <h3 style={{
                                fontFamily: 'Inter', fontSize: 14, fontWeight: 600, color: '#e0e0e0',
                                marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>
                                {name}
                            </h3>
                            <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#444' }}>{company}</p>
                        </div>
                    </div>

                    {/* rating & quality score */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ display: 'flex', gap: 2 }}>
                                {Array(5).fill(0).map((_, j) => (
                                    <Star key={j} size={10} fill={j < Math.floor(quality / 20) ? '#555' : 'transparent'} color="#555" />
                                ))}
                            </div>
                            <span style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 600, color: '#666' }}>
                                {(quality / 20).toFixed(1)}
                            </span>
                        </div>
                        <span style={{
                            fontFamily: 'Inter', fontSize: 11, color: '#5a9a5a',
                            background: 'rgba(74,138,74,0.1)', padding: '2px 8px', borderRadius: 100,
                            border: '1px solid rgba(74,138,74,0.2)',
                        }}>
                            Score: {quality}%
                        </span>
                    </div>

                    {/* desc */}
                    <p style={{
                        fontFamily: 'Inter', fontSize: 13, color: '#4a4a4a', lineHeight: 1.7,
                        marginBottom: 18, display: '-webkit-box', WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                        {desc}
                    </p>

                    {/* pricing */}
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', padding: '11px 14px',
                        borderRadius: 12, background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.05)', marginBottom: 14,
                    }}>
                        <div>
                            <div style={{ fontFamily: 'Inter', fontSize: 10, color: '#333', marginBottom: 3 }}>Per request</div>
                            <div style={{ fontFamily: 'Inter', fontSize: 15, fontWeight: 700, color: '#ccc', letterSpacing: '-0.02em' }}>
                                ${price.toFixed(4)}
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontFamily: 'Inter', fontSize: 10, color: '#333', marginBottom: 3 }}>Rate limit</div>
                            <div style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 500, color: '#666' }}>
                                {rateLimit > 0 ? `${rateLimit.toLocaleString()} req/min` : '—'}
                            </div>
                        </div>
                    </div>

                    {/* badges */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                        <span style={{
                            padding: '4px 10px', borderRadius: 8,
                            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                            fontFamily: 'Inter', fontSize: 11, color: '#444',
                        }}>
                            {network}
                        </span>
                        <span style={{ fontFamily: 'Inter', fontSize: 11, color: '#333' }}>
                            {payment === 'exact' ? 'Pay-per-Request' : 'Usage Cap'}
                        </span>
                    </div>

                    {/* stats row */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14,
                    }}>
                        <div style={{
                            padding: '8px 10px', borderRadius: 10,
                            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                            textAlign: 'center',
                        }}>
                            <Clock size={12} color="#555" style={{ margin: '0 auto 4px' }} />
                            <div style={{ fontFamily: 'Inter', fontSize: 10, color: '#444' }}>{latency}ms</div>
                        </div>
                        <div style={{
                            padding: '8px 10px', borderRadius: 10,
                            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                            textAlign: 'center',
                        }}>
                            <Shield size={12} color="#555" style={{ margin: '0 auto 4px' }} />
                            <div style={{ fontFamily: 'Inter', fontSize: 10, color: '#444' }}>{reliability}%</div>
                        </div>
                        <div style={{
                            padding: '8px 10px', borderRadius: 10,
                            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                            textAlign: 'center',
                        }}>
                            <Activity size={12} color="#555" style={{ margin: '0 auto 4px' }} />
                            <div style={{ fontFamily: 'Inter', fontSize: 10, color: '#444' }}>{category}</div>
                        </div>
                    </div>

                    {/* tags */}
                    {tags.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                            {tags.slice(0, 5).map((tag) => (
                                <span
                                    key={tag}
                                    style={{
                                        padding: '3px 9px', borderRadius: 100,
                                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                                        fontFamily: 'Inter', fontSize: 10, color: '#555',
                                    }}
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* CTA */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        style={{
                            width: '100%', padding: '11px', borderRadius: 13,
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: 'rgba(255,255,255,0.06)', color: '#bbb',
                            fontFamily: 'Inter', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                            transition: 'background 0.2s, color 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.11)';
                            (e.currentTarget as HTMLButtonElement).style.color = '#eee';
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)';
                            (e.currentTarget as HTMLButtonElement).style.color = '#bbb';
                        }}
                    >
                        View & Purchase
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
}
