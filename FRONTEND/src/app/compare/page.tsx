'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X, Trash2, Trophy, Zap, Clock, Shield, Star, DollarSign, GitCompareArrows, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCompare } from '@/context/CompareContext';
import { apis } from '@/lib/data/marketplaceApis';
import type { MarketplaceApi } from '@/lib/data/marketplaceApis';

// ─── Helpers ──────────────────────────────────────────────

function parsePrice(p: string): number {
    return parseFloat(p.replace(/[^0-9.]/g, '')) || 0;
}

function findBest(list: MarketplaceApi[], key: 'qualityScore' | 'latency' | 'reliability', mode: 'max' | 'min'): string | null {
    if (list.length === 0) return null;
    let bestId = list[0].id;
    let bestVal = (list[0] as any)[key] ?? (key === 'latency' ? 9999 : 0);
    for (const p of list) {
        const v = (p as any)[key] ?? (key === 'latency' ? 9999 : 0);
        if (mode === 'max' ? v > bestVal : v < bestVal) {
            bestVal = v;
            bestId = p.id;
        }
    }
    return bestId;
}

function findLowestPrice(list: MarketplaceApi[]): string | null {
    if (list.length === 0) return null;
    let bestId = list[0].id;
    let bestVal = parsePrice(list[0].price);
    for (const p of list) {
        const v = parsePrice(p.price);
        if (v < bestVal) { bestVal = v; bestId = p.id; }
    }
    return bestId;
}

function computeOverall(api: MarketplaceApi): number {
    const q = api.qualityScore * 0.4;
    const priceVal = parsePrice(api.price);
    const pScore = Math.max(0, (1 - priceVal / 0.01)) * 100 * 0.3;
    const r = (api.reliability ?? 99) * 0.2;
    const l = Math.max(0, (1 - (api.latency ?? 500) / 5000)) * 100 * 0.1;
    return Math.round((q + pScore + r + l) * 10) / 10;
}

// ─── Badge Component ──────────────────────────────────────

function WinnerBadge({ label }: { label: string }) {
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '3px 8px', borderRadius: 6,
            background: 'rgba(90,154,90,0.15)', border: '1px solid rgba(90,154,90,0.3)',
            color: '#5a9a5a', fontSize: 10, fontFamily: 'Inter', fontWeight: 600,
        }}>
            <Trophy size={10} /> {label}
        </span>
    );
}

// ─── Row Component ────────────────────────────────────────

interface RowProps {
    label: string;
    values: (string | React.ReactNode)[];
    highlights?: (boolean)[];
}

function CompareRow({ label, values, highlights }: RowProps) {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: `160px repeat(${values.length}, 1fr)`,
            borderBottom: '1px solid rgba(255,255,255,0.04)',
        }}>
            <div style={{
                padding: '14px 16px',
                fontSize: 12, fontFamily: 'Inter', fontWeight: 500, color: '#666',
                display: 'flex', alignItems: 'center',
            }}>
                {label}
            </div>
            {values.map((v, i) => (
                <div key={i} style={{
                    padding: '14px 16px',
                    fontSize: 13, fontFamily: 'Inter', fontWeight: 500,
                    color: highlights?.[i] ? '#5a9a5a' : '#ccc',
                    background: highlights?.[i] ? 'rgba(90,154,90,0.04)' : 'transparent',
                    display: 'flex', alignItems: 'center',
                    transition: 'background 0.3s',
                }}>
                    {v}
                </div>
            ))}
        </div>
    );
}

// ─── Add Provider Slot ────────────────────────────────────

function AddProviderSlot({ existingIds }: { existingIds: string[] }) {
    const { addToCompare } = useCompare();
    const available = apis.filter(a => !existingIds.includes(a.id));

    if (available.length === 0) return null;

    return (
        <div style={{
            minWidth: 220, padding: 20, borderRadius: 16,
            border: '2px dashed rgba(255,255,255,0.08)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 12, minHeight: 120,
        }}>
            <GitCompareArrows size={20} color="#444" />
            <span style={{ fontSize: 12, color: '#555', fontFamily: 'Inter' }}>Add Provider</span>
            <select
                onChange={(e) => {
                    const api = apis.find(a => a.id === e.target.value);
                    if (api) addToCompare(api);
                    e.target.value = '';
                }}
                defaultValue=""
                style={{
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8, padding: '6px 10px', color: '#aaa', fontSize: 11,
                    fontFamily: 'Inter', cursor: 'pointer', maxWidth: 180,
                }}
            >
                <option value="" disabled>Select provider...</option>
                {available.map(a => (
                    <option key={a.id} value={a.id} style={{ background: '#111', color: '#ccc' }}>
                        {a.name}
                    </option>
                ))}
            </select>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────

export default function ComparePage() {
    const router = useRouter();
    const { compareList, removeFromCompare, clearCompare } = useCompare();

    const lowestPriceId = findLowestPrice(compareList);
    const highestQualityId = findBest(compareList, 'qualityScore', 'max');
    const lowestLatencyId = findBest(compareList, 'latency', 'min');
    const highestReliabilityId = findBest(compareList, 'reliability', 'max');

    // Best Overall
    const overallScores = compareList.map(a => ({ id: a.id, score: computeOverall(a) }));
    const bestOverallId = overallScores.length > 0
        ? overallScores.reduce((best, cur) => cur.score > best.score ? cur : best).id
        : null;

    const handleSelectForPurchase = (api: MarketplaceApi) => {
        router.push(`/agent-advisor?providerId=${api.id}&category=${encodeURIComponent(api.cat)}&task=${encodeURIComponent(api.name)}`);
    };

    return (
        <div style={{ background: '#050505', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main style={{ flex: 1, paddingTop: 100, paddingBottom: 120 }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px' }}>

                    {/* Back Link */}
                    <Link href="/marketplace" style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        color: '#777', fontFamily: 'Inter', fontSize: 13, textDecoration: 'none',
                        marginBottom: 40, transition: 'color 0.2s',
                    }}>
                        <ArrowLeft size={14} /> Back to Marketplace
                    </Link>

                    {/* Header */}
                    <div style={{ marginBottom: 48 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                            <div style={{
                                width: 48, height: 48, borderRadius: 14,
                                background: 'linear-gradient(135deg, rgba(90,154,90,0.2) 0%, rgba(90,154,90,0.05) 100%)',
                                border: '1px solid rgba(90,154,90,0.2)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <GitCompareArrows size={22} color="#5a9a5a" />
                            </div>
                            <div>
                                <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', color: '#efefef', margin: 0 }}>
                                    Compare Providers
                                </h1>
                                <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#666', marginTop: 4 }}>
                                    Side-by-side comparison of up to 3 API providers
                                </p>
                            </div>
                        </div>

                        {compareList.length > 0 && (
                            <motion.button
                                onClick={clearCompare}
                                whileHover={{ background: 'rgba(180,60,60,0.15)' }}
                                style={{
                                    marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6,
                                    padding: '8px 16px', borderRadius: 10,
                                    border: '1px solid rgba(180,60,60,0.25)', background: 'rgba(180,60,60,0.08)',
                                    color: '#c06060', fontSize: 12, fontFamily: 'Inter', fontWeight: 500,
                                    cursor: 'pointer', transition: 'background 0.2s',
                                }}
                            >
                                <Trash2 size={13} /> Clear All
                            </motion.button>
                        )}
                    </div>

                    {/* Empty State */}
                    {compareList.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                textAlign: 'center', padding: '80px 20px',
                                border: '2px dashed rgba(255,255,255,0.06)', borderRadius: 24,
                            }}
                        >
                            <GitCompareArrows size={40} color="#333" style={{ marginBottom: 16 }} />
                            <h2 style={{ fontFamily: 'Playfair Display', fontSize: 24, color: '#888', marginBottom: 8 }}>
                                No Providers Selected
                            </h2>
                            <p style={{ fontFamily: 'Inter', fontSize: 14, color: '#555', marginBottom: 24 }}>
                                Visit a provider&apos;s details page and click &quot;Compare&quot; to add providers here.
                            </p>
                            <Link href="/marketplace" style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                padding: '12px 24px', borderRadius: 12,
                                background: '#efefef', color: '#050505',
                                fontFamily: 'Inter', fontSize: 13, fontWeight: 600, textDecoration: 'none',
                            }}>
                                Browse Marketplace <ChevronRight size={14} />
                            </Link>
                        </motion.div>
                    )}

                    {/* Comparison Content */}
                    {compareList.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.4 }}
                        >
                            {/* Provider Header Cards */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: `160px repeat(${compareList.length}, 1fr)${compareList.length < 3 ? ' auto' : ''}`,
                                marginBottom: 0,
                                position: 'sticky', top: 64, zIndex: 10,
                                background: 'rgba(5,5,5,0.95)', backdropFilter: 'blur(20px)',
                                borderRadius: '20px 20px 0 0',
                                border: '1px solid rgba(255,255,255,0.06)',
                                borderBottom: 'none',
                            }}>
                                {/* Empty cell for row label column */}
                                <div style={{ padding: 20, display: 'flex', alignItems: 'center' }}>
                                    <span style={{ fontSize: 11, color: '#444', fontFamily: 'Inter', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                        Attribute
                                    </span>
                                </div>

                                {compareList.map((api, i) => (
                                    <motion.div
                                        key={api.id}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        style={{
                                            padding: 20,
                                            borderLeft: '1px solid rgba(255,255,255,0.04)',
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                            <div>
                                                <h3 style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: 600, color: '#e0e0e0', margin: 0, marginBottom: 2 }}>
                                                    {api.name}
                                                </h3>
                                                <span style={{ fontSize: 11, color: '#666', fontFamily: 'Inter' }}>
                                                    by {api.provider}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => removeFromCompare(api.id)}
                                                style={{
                                                    background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 8,
                                                    padding: 6, cursor: 'pointer', color: '#666', transition: 'color 0.2s',
                                                }}
                                                title="Remove"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>

                                        {/* Badges */}
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                            {bestOverallId === api.id && <WinnerBadge label="Best Overall" />}
                                            {lowestPriceId === api.id && <WinnerBadge label="Best Price" />}
                                            {highestQualityId === api.id && <WinnerBadge label="Top Quality" />}
                                            {lowestLatencyId === api.id && <WinnerBadge label="Fastest" />}
                                            {highestReliabilityId === api.id && <WinnerBadge label="Most Reliable" />}
                                        </div>
                                    </motion.div>
                                ))}

                                {/* Add slot in header */}
                                {compareList.length < 3 && (
                                    <div style={{ borderLeft: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12 }}>
                                        <AddProviderSlot existingIds={compareList.map(p => p.id)} />
                                    </div>
                                )}
                            </div>

                            {/* Data Rows */}
                            <div style={{
                                background: 'rgba(12,12,14,0.9)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                borderTop: '1px solid rgba(255,255,255,0.04)',
                                borderRadius: '0 0 20px 20px',
                                overflow: 'hidden',
                            }}>
                                <CompareRow label="Category" values={compareList.map(a => a.cat)} />
                                <CompareRow label="Description" values={compareList.map(a =>
                                    <span key={a.id} style={{ fontSize: 12, lineHeight: 1.5, color: '#999' }}>{a.desc}</span>
                                )} />
                                <CompareRow
                                    label="Price"
                                    values={compareList.map(a => <span key={a.id} style={{ fontWeight: 600 }}>{a.price}</span>)}
                                    highlights={compareList.map(a => a.id === lowestPriceId)}
                                />
                                <CompareRow label="Payment Model" values={compareList.map(a => a.model)} />
                                <CompareRow label="Rate Limit" values={compareList.map(a => a.cap)} />
                                <CompareRow
                                    label="Quality Score"
                                    values={compareList.map(a => <span key={a.id} style={{ fontWeight: 600 }}>{a.qualityScore}%</span>)}
                                    highlights={compareList.map(a => a.id === highestQualityId)}
                                />
                                <CompareRow
                                    label="Latency"
                                    values={compareList.map(a => <span key={a.id}>{a.latency ?? 'N/A'}ms</span>)}
                                    highlights={compareList.map(a => a.id === lowestLatencyId)}
                                />
                                <CompareRow
                                    label="Reliability"
                                    values={compareList.map(a => <span key={a.id}>{a.reliability ?? 'N/A'}%</span>)}
                                    highlights={compareList.map(a => a.id === highestReliabilityId)}
                                />
                                <CompareRow label="Network" values={compareList.map(a => a.network ?? a.chain)} />
                                <CompareRow label="Authentication" values={compareList.map(a => a.authType ?? 'api-key')} />
                                <CompareRow label="Methods" values={compareList.map(a => (a.supportedMethods ?? ['POST']).join(', '))} />
                                <CompareRow label="Endpoint" values={compareList.map(a =>
                                    <span key={a.id} style={{ fontSize: 11, fontFamily: 'monospace', color: '#888' }}>{a.endpoint ?? '—'}</span>
                                )} />
                                <CompareRow label="Rating" values={compareList.map(a =>
                                    <span key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <Star size={12} color="#5a9a5a" /> {a.rating} ({a.reviews} reviews)
                                    </span>
                                )} />
                                <CompareRow label="Tags" values={compareList.map(a =>
                                    <div key={a.id} style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                        {(a.tags ?? []).map(t => (
                                            <span key={t} style={{
                                                padding: '2px 8px', borderRadius: 6,
                                                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                                                fontSize: 10, color: '#888', fontFamily: 'Inter',
                                            }}>{t}</span>
                                        ))}
                                    </div>
                                )} />
                                <CompareRow
                                    label="Overall Score"
                                    values={compareList.map(a => {
                                        const score = computeOverall(a);
                                        return (
                                            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span style={{ fontWeight: 700, fontSize: 16, color: a.id === bestOverallId ? '#5a9a5a' : '#ccc' }}>
                                                    {score}
                                                </span>
                                                <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden', maxWidth: 100 }}>
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${score}%` }}
                                                        transition={{ duration: 0.8, delay: 0.2 }}
                                                        style={{ height: '100%', borderRadius: 4, background: a.id === bestOverallId ? '#5a9a5a' : '#555' }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                    highlights={compareList.map(a => a.id === bestOverallId)}
                                />

                                {/* Action Row */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: `160px repeat(${compareList.length}, 1fr)`,
                                    borderTop: '1px solid rgba(255,255,255,0.06)',
                                }}>
                                    <div style={{ padding: 16, display: 'flex', alignItems: 'center', fontSize: 12, fontFamily: 'Inter', color: '#555' }}>
                                        Action
                                    </div>
                                    {compareList.map(api => (
                                        <div key={api.id} style={{ padding: 16, borderLeft: '1px solid rgba(255,255,255,0.04)' }}>
                                            <motion.button
                                                onClick={() => handleSelectForPurchase(api)}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                style={{
                                                    width: '100%', padding: '12px 16px', borderRadius: 12,
                                                    background: api.id === bestOverallId ? '#efefef' : 'rgba(255,255,255,0.06)',
                                                    color: api.id === bestOverallId ? '#050505' : '#ccc',
                                                    fontFamily: 'Inter', fontSize: 12, fontWeight: 600,
                                                    border: api.id === bestOverallId ? 'none' : '1px solid rgba(255,255,255,0.08)',
                                                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                                                    justifyContent: 'center', gap: 6, transition: 'all 0.2s',
                                                }}
                                            >
                                                <Zap size={13} /> Select for Purchase
                                            </motion.button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
