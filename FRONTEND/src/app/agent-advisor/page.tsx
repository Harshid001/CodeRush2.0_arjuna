'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Brain, Shield, Activity, Award, Zap, Clock, Star, DollarSign, ChevronRight, CheckCircle2, XCircle, AlertTriangle, Loader2, Server, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { apis } from '@/lib/data/marketplaceApis';
import type { MarketplaceApi } from '@/lib/data/marketplaceApis';

// ─── Deterministic Scoring Engine (no LLM) ───────────────

interface ScoredProvider {
    api: MarketplaceApi;
    scores: { quality: number; price: number; reliability: number; latency: number };
    normalizedScores: { quality: number; price: number; reliability: number; latency: number };
    weightedScores: { quality: number; price: number; reliability: number; latency: number };
    overall: number;
    rank: number;
}

interface PolicyResult {
    api: MarketplaceApi;
    passed: boolean;
    failedRules: { rule: string; reason: string }[];
}

interface DecisionResult {
    winner: ScoredProvider;
    top3: ScoredProvider[];
    allRanked: ScoredProvider[];
    rejected: PolicyResult[];
    reasons: string[];
    explanation: string;
}

const WEIGHTS = { quality: 40, price: 30, reliability: 20, latency: 10 };
const POLICY = { maxPrice: 0.05, minQuality: 80, maxLatency: 3000, minReliability: 95 };

function parsePrice(p: string): number {
    return parseFloat(p.replace(/[^0-9.]/g, '')) || 0;
}

function normalize(val: number, min: number, max: number, lowerBetter: boolean): number {
    if (max === min) return 100;
    const ratio = (val - min) / (max - min);
    return parseFloat(((lowerBetter ? 1 - ratio : ratio) * 100).toFixed(2));
}

function runPolicyEngine(providers: MarketplaceApi[]): { eligible: MarketplaceApi[]; rejected: PolicyResult[] } {
    const eligible: MarketplaceApi[] = [];
    const rejected: PolicyResult[] = [];

    for (const api of providers) {
        const failed: { rule: string; reason: string }[] = [];
        const price = parsePrice(api.price);
        if (price > POLICY.maxPrice) failed.push({ rule: 'Per-Request Budget', reason: `Price ${api.price} exceeds $${POLICY.maxPrice} limit` });
        if (api.qualityScore < POLICY.minQuality) failed.push({ rule: 'Minimum Quality', reason: `Quality ${api.qualityScore}% below ${POLICY.minQuality}% threshold` });
        if ((api.latency ?? 500) > POLICY.maxLatency) failed.push({ rule: 'Maximum Latency', reason: `Latency ${api.latency}ms exceeds ${POLICY.maxLatency}ms cap` });
        if ((api.reliability ?? 99) < POLICY.minReliability) failed.push({ rule: 'Minimum Reliability', reason: `Reliability ${api.reliability}% below ${POLICY.minReliability}% threshold` });

        if (failed.length > 0) {
            rejected.push({ api, passed: false, failedRules: failed });
        } else {
            eligible.push(api);
        }
    }
    return { eligible, rejected };
}

function runDecisionEngine(eligible: MarketplaceApi[], rejected: PolicyResult[], category: string, taskName: string): DecisionResult | null {
    if (eligible.length === 0) return null;

    const prices = eligible.map(a => parsePrice(a.price));
    const latencies = eligible.map(a => a.latency ?? 500);
    const minPrice = Math.min(...prices), maxPrice = Math.max(...prices);
    const minLat = Math.min(...latencies), maxLat = Math.max(...latencies);

    const scored: ScoredProvider[] = eligible.map(api => {
        const raw = {
            quality: api.qualityScore,
            price: parsePrice(api.price),
            reliability: api.reliability ?? 99,
            latency: api.latency ?? 500,
        };
        const norm = {
            quality: normalize(raw.quality, 0, 100, false),
            price: normalize(raw.price, minPrice, maxPrice, true),
            reliability: normalize(raw.reliability, 0, 100, false),
            latency: normalize(raw.latency, minLat, maxLat, true),
        };
        const weighted = {
            quality: parseFloat(((norm.quality / 100) * WEIGHTS.quality).toFixed(2)),
            price: parseFloat(((norm.price / 100) * WEIGHTS.price).toFixed(2)),
            reliability: parseFloat(((norm.reliability / 100) * WEIGHTS.reliability).toFixed(2)),
            latency: parseFloat(((norm.latency / 100) * WEIGHTS.latency).toFixed(2)),
        };
        const overall = parseFloat((weighted.quality + weighted.price + weighted.reliability + weighted.latency).toFixed(1));
        return { api, scores: raw, normalizedScores: norm, weightedScores: weighted, overall, rank: 0 };
    });

    scored.sort((a, b) => b.overall - a.overall);
    scored.forEach((s, i) => s.rank = i + 1);

    const winner = scored[0];
    const reasons: string[] = [];
    reasons.push(`${winner.api.name} achieved the highest weighted score of ${winner.overall}/100.`);
    if (winner.normalizedScores.quality >= 90) reasons.push(`Exceptional quality at ${winner.scores.quality}%.`);
    if (winner.normalizedScores.price >= 70) reasons.push(`Competitive pricing at ${winner.api.price}/request.`);
    if (winner.scores.reliability >= 99) reasons.push(`Enterprise-grade reliability at ${winner.scores.reliability}%.`);
    if (winner.normalizedScores.latency >= 70) reasons.push(`Low latency of ${winner.scores.latency}ms for fast responses.`);
    if (scored.length > 1) {
        const margin = winner.overall - scored[1].overall;
        reasons.push(margin >= 3 ? `Outperformed runner-up by ${margin.toFixed(1)} points.` : `Close decision — edged out ${scored[1].api.name} by ${margin.toFixed(1)} points.`);
    }

    const explanation = `${winner.api.name} was selected as the optimal provider for "${taskName}". Out of ${apis.length} marketplace providers, ${eligible.length + rejected.length} matched the "${category}" category. ${eligible.length} passed all policy checks while ${rejected.length} were rejected. The decision engine applied weighted scoring (Quality: ${WEIGHTS.quality}%, Price: ${WEIGHTS.price}%, Reliability: ${WEIGHTS.reliability}%, Latency: ${WEIGHTS.latency}%) with min-max normalization across the eligible pool.`;

    return { winner, top3: scored.slice(0, 3), allRanked: scored, rejected, reasons, explanation };
}

// ─── Reasoning Step Timeline ──────────────────────────────

type StepStatus = 'pending' | 'running' | 'done' | 'error';

interface ReasoningStep {
    id: string;
    label: string;
    detail?: string;
    status: StepStatus;
}

// ─── Inner Component (uses useSearchParams) ───────────────

function AgentAdvisorInner() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const providerId = searchParams.get('providerId');
    const category = searchParams.get('category') || '';
    const taskName = searchParams.get('task') || 'API Procurement';

    const [steps, setSteps] = useState<ReasoningStep[]>([]);
    const [decision, setDecision] = useState<DecisionResult | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [noResult, setNoResult] = useState(false);
    const [showRejected, setShowRejected] = useState(false);
    const handleProceedToPayment = (api: MarketplaceApi) => {
        router.push(`/payment?providerId=${api.id}`);
    };

    const updateStep = (id: string, updates: Partial<ReasoningStep>) => {
        setSteps(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    };

    const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

    const runPipeline = useCallback(async () => {
        setIsRunning(true);
        setDecision(null);
        setNoResult(false);

        const initialSteps: ReasoningStep[] = [
            { id: 'search', label: 'Scanning marketplace for matching providers', status: 'running' },
            { id: 'policy', label: 'Running agent policy engine', status: 'pending' },
            { id: 'score', label: 'Computing weighted scores & rankings', status: 'pending' },
            { id: 'explain', label: 'Generating decision explanation', status: 'pending' },
        ];
        setSteps(initialSteps);

        // Step 1: Search
        await delay(700);
        const matched = category
            ? apis.filter(a => a.cat.toLowerCase() === category.toLowerCase())
            : apis;

        if (matched.length === 0) {
            updateStep('search', { status: 'error', detail: `No providers found for category "${category}".` });
            setNoResult(true);
            setIsRunning(false);
            return;
        }
        updateStep('search', { status: 'done', detail: `Found ${matched.length} providers in "${category || 'All'}"` });

        // Step 2: Policy
        await delay(600);
        setSteps(prev => prev.map(s => s.id === 'policy' ? { ...s, status: 'running' } : s));
        await delay(500);
        const { eligible, rejected } = runPolicyEngine(matched);

        if (eligible.length === 0) {
            updateStep('policy', { status: 'error', detail: `All ${rejected.length} providers failed policy checks.` });
            setNoResult(true);
            setIsRunning(false);
            return;
        }
        updateStep('policy', { status: 'done', detail: `${eligible.length} passed, ${rejected.length} rejected` });

        // Step 3: Score
        await delay(500);
        setSteps(prev => prev.map(s => s.id === 'score' ? { ...s, status: 'running' } : s));
        await delay(600);
        const result = runDecisionEngine(eligible, rejected, category, taskName);

        if (!result) {
            updateStep('score', { status: 'error', detail: 'Scoring failed.' });
            setNoResult(true);
            setIsRunning(false);
            return;
        }
        updateStep('score', { status: 'done', detail: `Winner: ${result.winner.api.name} (${result.winner.overall}/100)` });

        // Step 4: Explain
        await delay(400);
        setSteps(prev => prev.map(s => s.id === 'explain' ? { ...s, status: 'running' } : s));
        await delay(500);
        updateStep('explain', { status: 'done', detail: 'Decision proof generated' });

        setDecision(result);
        setIsRunning(false);
    }, [category, taskName]);

    useEffect(() => {
        runPipeline();
    }, [runPipeline]);



    return (
        <div style={{ background: '#050505', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main style={{ flex: 1, paddingTop: 100, paddingBottom: 120 }}>
                <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 28px' }}>

                    <Link href="/marketplace" style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        color: '#777', fontFamily: 'Inter', fontSize: 13, textDecoration: 'none',
                        marginBottom: 40, transition: 'color 0.2s',
                    }}>
                        <ArrowLeft size={14} /> Back to Marketplace
                    </Link>

                    {/* Hero */}
                    <div style={{
                        padding: '40px 32px', borderRadius: 24, marginBottom: 40,
                        background: 'linear-gradient(135deg, rgba(12,12,18,0.95) 0%, rgba(22,18,32,0.9) 50%, rgba(12,12,18,0.95) 100%)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        position: 'relative', overflow: 'hidden',
                    }}>
                        <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, background: 'radial-gradient(circle, rgba(90,154,90,0.08) 0%, transparent 70%)', borderRadius: '50%' }} />

                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                            <div style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(90,154,90,0.12)', border: '1px solid rgba(90,154,90,0.2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Brain size={13} color="#5a9a5a" />
                                <span style={{ fontSize: 11, fontFamily: 'Inter', fontWeight: 600, color: '#5a9a5a' }}>Autonomous Agent Active</span>
                            </div>
                        </div>

                        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', color: '#efefef', margin: '0 0 8px 0' }}>
                            AI Purchase Advisor
                        </h1>
                        <p style={{ fontFamily: 'Inter', fontSize: 14, color: '#888', maxWidth: 600, lineHeight: 1.6 }}>
                            Deterministic decision engine scanning providers, evaluating policy compliance, scoring weighted dimensions, and recommending the optimal API for your task.
                        </p>

                        {providerId && (
                            <div style={{ marginTop: 16, padding: '8px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                <Server size={12} color="#666" />
                                <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#888' }}>Source: {providerId}</span>
                                <span style={{ fontSize: 11, color: '#555' }}>•</span>
                                <span style={{ fontSize: 11, fontFamily: 'Inter', color: '#888' }}>Category: {category}</span>
                            </div>
                        )}
                    </div>

                    {/* Reasoning Timeline */}
                    <div style={{
                        borderRadius: 20, marginBottom: 32,
                        background: 'rgba(12,12,14,0.9)', border: '1px solid rgba(255,255,255,0.06)',
                        overflow: 'hidden',
                    }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Brain size={16} color="#5a9a5a" />
                            <div>
                                <h3 style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: 600, color: '#e0e0e0', margin: 0 }}>Reasoning Trace</h3>
                                <p style={{ fontFamily: 'Inter', fontSize: 11, color: '#555', margin: '2px 0 0' }}>Step-by-step decision pipeline</p>
                            </div>
                        </div>
                        <div style={{ padding: '24px 24px 24px 40px' }}>
                            <div style={{ borderLeft: '2px solid rgba(255,255,255,0.06)', paddingLeft: 20 }}>
                                {steps.map((step, i) => (
                                    <motion.div
                                        key={step.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.08 }}
                                        style={{ position: 'relative', marginBottom: i < steps.length - 1 ? 24 : 0 }}
                                    >
                                        {/* Dot */}
                                        <div style={{
                                            position: 'absolute', left: -27, top: 2,
                                            width: 10, height: 10, borderRadius: '50%',
                                            background: step.status === 'done' ? '#5a9a5a'
                                                : step.status === 'running' ? '#e8a838'
                                                : step.status === 'error' ? '#c06060' : '#333',
                                            border: `2px solid ${step.status === 'done' ? '#5a9a5a' : step.status === 'running' ? '#e8a838' : step.status === 'error' ? '#c06060' : '#333'}`,
                                            boxShadow: step.status === 'running' ? '0 0 8px rgba(232,168,56,0.4)' : 'none',
                                        }} />
                                        <span style={{ fontSize: 13, fontFamily: 'Inter', fontWeight: 500, color: '#ddd', display: 'block' }}>
                                            {step.label}
                                        </span>
                                        {step.status === 'running' && (
                                            <span style={{ fontSize: 11, color: '#e8a838', fontFamily: 'Inter', display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                                                <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> Processing...
                                            </span>
                                        )}
                                        {step.detail && (
                                            <span style={{ fontSize: 11, fontFamily: 'Inter', color: step.status === 'error' ? '#c06060' : '#666', display: 'block', marginTop: 3 }}>
                                                {step.detail}
                                            </span>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* No Result State */}
                    {noResult && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                padding: 40, borderRadius: 20, textAlign: 'center',
                                border: '1px solid rgba(180,60,60,0.2)', background: 'rgba(180,60,60,0.04)',
                            }}
                        >
                            <AlertTriangle size={32} color="#c06060" style={{ marginBottom: 12 }} />
                            <h3 style={{ fontFamily: 'Inter', fontSize: 16, color: '#ddd', marginBottom: 8 }}>No Eligible Providers</h3>
                            <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#888', marginBottom: 20 }}>
                                All matched providers were filtered out by the policy engine. Try adjusting your task category or budget constraints.
                            </p>
                            <Link href="/marketplace" style={{
                                padding: '10px 20px', borderRadius: 10, background: '#efefef', color: '#050505',
                                fontFamily: 'Inter', fontSize: 13, fontWeight: 600, textDecoration: 'none',
                            }}>
                                Browse Marketplace
                            </Link>
                        </motion.div>
                    )}

                    {/* Decision Result */}
                    {decision && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            {/* Winner Card */}
                            <div style={{
                                borderRadius: 20, padding: 32, marginBottom: 28,
                                background: 'linear-gradient(155deg, rgba(22,22,26,0.95) 0%, rgba(12,12,14,0.95) 100%)',
                                border: '1px solid rgba(90,154,90,0.2)',
                                boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
                                position: 'relative', overflow: 'hidden',
                            }}>
                                <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, background: 'radial-gradient(circle, rgba(90,154,90,0.06), transparent 70%)', borderRadius: '50%' }} />

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 24 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(90,154,90,0.1)', border: '1px solid rgba(90,154,90,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Award size={26} color="#5a9a5a" />
                                        </div>
                                        <div>
                                            <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 6, background: 'rgba(90,154,90,0.15)', border: '1px solid rgba(90,154,90,0.3)', color: '#5a9a5a', fontSize: 10, fontFamily: 'Inter', fontWeight: 600, marginBottom: 6 }}>
                                                RECOMMENDED WINNER
                                            </span>
                                            <h2 style={{ fontFamily: 'Inter', fontSize: 20, fontWeight: 700, color: '#efefef', margin: 0 }}>
                                                {decision.winner.api.name}
                                            </h2>
                                            <span style={{ fontFamily: 'Inter', fontSize: 12, color: '#666' }}>
                                                by {decision.winner.api.provider} • {decision.winner.api.network ?? decision.winner.api.chain}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ fontSize: 11, color: '#555', fontFamily: 'Inter', display: 'block' }}>Decision Score</span>
                                        <span style={{ fontSize: 36, fontWeight: 800, color: '#5a9a5a', fontFamily: 'Inter', lineHeight: 1 }}>
                                            {decision.winner.overall}
                                            <span style={{ fontSize: 14, color: '#666', fontWeight: 400 }}> / 100</span>
                                        </span>
                                    </div>
                                </div>

                                {/* Score Breakdown */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
                                    {([
                                        { label: 'Quality', val: `${decision.winner.scores.quality}%`, weighted: decision.winner.weightedScores.quality, max: WEIGHTS.quality, color: '#5a9a5a' },
                                        { label: 'Price', val: decision.winner.api.price, weighted: decision.winner.weightedScores.price, max: WEIGHTS.price, color: '#e8a838' },
                                        { label: 'Reliability', val: `${decision.winner.scores.reliability}%`, weighted: decision.winner.weightedScores.reliability, max: WEIGHTS.reliability, color: '#8b5cf6' },
                                        { label: 'Latency', val: `${decision.winner.scores.latency}ms`, weighted: decision.winner.weightedScores.latency, max: WEIGHTS.latency, color: '#3b82f6' },
                                    ] as const).map(dim => (
                                        <div key={dim.label} style={{ padding: 14, borderRadius: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontFamily: 'Inter', color: '#888', marginBottom: 8 }}>
                                                <span>{dim.label}</span>
                                                <span style={{ color: '#ccc', fontWeight: 600 }}>{dim.val}</span>
                                            </div>
                                            <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden', marginBottom: 6 }}>
                                                <motion.div initial={{ width: 0 }} animate={{ width: `${(dim.weighted / dim.max) * 100}%` }} transition={{ duration: 0.8, delay: 0.3 }} style={{ height: '100%', borderRadius: 4, background: dim.color }} />
                                            </div>
                                            <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#555' }}>{dim.weighted} / {dim.max}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Explanation */}
                                <div style={{ padding: 20, borderRadius: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', marginBottom: 24 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                        <Brain size={14} color="#5a9a5a" />
                                        <span style={{ fontSize: 12, fontFamily: 'Inter', fontWeight: 600, color: '#5a9a5a' }}>Decision Explanation</span>
                                    </div>
                                    <p style={{ fontSize: 13, fontFamily: 'Inter', color: '#999', lineHeight: 1.7, margin: 0 }}>
                                        {decision.explanation}
                                    </p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
                                        {decision.reasons.map((r, i) => (
                                            <span key={i} style={{
                                                padding: '5px 10px', borderRadius: 8,
                                                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                                                fontSize: 11, color: '#aaa', fontFamily: 'Inter',
                                            }}>
                                                ✓ {r}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Purchase Summary */}
                                <div style={{ padding: 24, borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                                        <h4 style={{ fontSize: 11, fontFamily: 'Inter', fontWeight: 700, color: '#5a9a5a', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                                            Purchase Summary
                                        </h4>
                                        <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#666' }}>
                                            x402 Protocol Ready
                                        </span>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginBottom: 20 }}>
                                        <div style={{ padding: 12, borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                                            <span style={{ fontSize: 10, color: '#555', fontFamily: 'monospace', display: 'block', marginBottom: 2 }}>SELECTED PROVIDER</span>
                                            <span style={{ fontSize: 13, color: '#efefef', fontFamily: 'Inter', fontWeight: 600 }}>{decision.winner.api.name}</span>
                                            <span style={{ fontSize: 11, color: '#666', fontFamily: 'Inter', display: 'block' }}>by {decision.winner.api.provider}</span>
                                        </div>

                                        <div style={{ padding: 12, borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                                            <span style={{ fontSize: 10, color: '#555', fontFamily: 'monospace', display: 'block', marginBottom: 2 }}>ESTIMATED COST / PRICE</span>
                                            <span style={{ fontSize: 14, color: '#5a9a5a', fontFamily: 'Inter', fontWeight: 700 }}>{decision.winner.api.price}</span>
                                            <span style={{ fontSize: 10, color: '#777', fontFamily: 'Inter', display: 'block' }}>{decision.winner.api.model}</span>
                                        </div>

                                        <div style={{ padding: 12, borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                                            <span style={{ fontSize: 10, color: '#555', fontFamily: 'monospace', display: 'block', marginBottom: 2 }}>PAYMENT TYPE & NETWORK</span>
                                            <span style={{ fontSize: 12, color: '#ccc', fontFamily: 'monospace', textTransform: 'uppercase', fontWeight: 600 }}>
                                                {decision.winner.api.model.toLowerCase().includes('cap') ? 'UPTO (Metered)' : 'EXACT (Fixed)'}
                                            </span>
                                            <span style={{ fontSize: 11, color: '#888', fontFamily: 'monospace', display: 'block' }}>{decision.winner.api.network ?? decision.winner.api.chain}</span>
                                        </div>

                                        <div style={{ padding: 12, borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                                            <span style={{ fontSize: 10, color: '#555', fontFamily: 'monospace', display: 'block', marginBottom: 2 }}>QUALITY & RELIABILITY</span>
                                            <span style={{ fontSize: 12, color: '#5a9a5a', fontFamily: 'Inter', fontWeight: 600 }}>
                                                {decision.winner.scores.quality}% Quality
                                            </span>
                                            <span style={{ fontSize: 11, color: '#aaa', fontFamily: 'Inter', display: 'block' }}>
                                                {decision.winner.scores.reliability}% Uptime • {decision.winner.scores.latency}ms Latency
                                            </span>
                                        </div>
                                    </div>

                                    {/* Decision Score & Reason Pill */}
                                    <div style={{ padding: 12, borderRadius: 10, background: 'rgba(90,154,90,0.06)', border: '1px solid rgba(90,154,90,0.15)', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                                        <div>
                                            <span style={{ fontSize: 10, color: '#5a9a5a', fontFamily: 'monospace', fontWeight: 600, display: 'block' }}>DECISION SCORE & REASON</span>
                                            <span style={{ fontSize: 12, color: '#ddd', fontFamily: 'Inter' }}>
                                                {decision.reasons[0] || `${decision.winner.api.name} ranked #1 with ${decision.winner.overall}/100 score.`}
                                            </span>
                                        </div>
                                        <span style={{ fontSize: 16, fontWeight: 800, color: '#5a9a5a', fontFamily: 'Inter' }}>
                                            {decision.winner.overall} / 100
                                        </span>
                                    </div>

                                    {/* Action Buttons */}
                                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                                        <Link
                                            href="/marketplace"
                                            style={{
                                                padding: '12px 20px', borderRadius: 12,
                                                background: 'rgba(255,255,255,0.04)', color: '#888',
                                                fontFamily: 'Inter', fontSize: 12, fontWeight: 500,
                                                border: '1px solid rgba(255,255,255,0.08)', textDecoration: 'none',
                                                display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s',
                                            }}
                                        >
                                            <ArrowLeft size={13} /> Back to Marketplace
                                        </Link>

                                        <motion.button
                                            onClick={() => handleProceedToPayment(decision.winner.api)}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            style={{
                                                padding: '14px 28px', borderRadius: 14,
                                                background: '#efefef', color: '#050505',
                                                fontFamily: 'Inter', fontSize: 13, fontWeight: 700,
                                                border: 'none', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', gap: 8,
                                                boxShadow: '0 8px 24px rgba(239,239,239,0.15)',
                                            }}
                                        >
                                            <Zap size={14} fill="#050505" /> Proceed to Payment <ChevronRight size={14} />
                                        </motion.button>
                                    </div>
                                </div>
                            </div>

                            {/* Ranking Table */}
                            <div style={{
                                borderRadius: 20, marginBottom: 28,
                                background: 'rgba(12,12,14,0.9)', border: '1px solid rgba(255,255,255,0.06)',
                                overflow: 'hidden',
                            }}>
                                <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Activity size={14} color="#5a9a5a" />
                                    <span style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: 600, color: '#ddd' }}>Candidate Ranking</span>
                                </div>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Inter', fontSize: 12 }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                                {['Rank', 'Provider', 'Quality', 'Price', 'Reliability', 'Latency', 'Score'].map(h => (
                                                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#555', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {decision.allRanked.map(s => (
                                                <tr key={s.api.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: s.rank === 1 ? 'rgba(90,154,90,0.04)' : 'transparent' }}>
                                                    <td style={{ padding: '12px 16px', fontWeight: 700, color: s.rank === 1 ? '#5a9a5a' : '#888' }}>{s.rank === 1 ? '🏆 #1' : `#${s.rank}`}</td>
                                                    <td style={{ padding: '12px 16px' }}>
                                                        <div style={{ fontWeight: 600, color: '#ddd' }}>{s.api.name}</div>
                                                        <div style={{ fontSize: 10, color: '#555' }}>{s.api.provider}</div>
                                                    </td>
                                                    <td style={{ padding: '12px 16px', color: '#ccc' }}>{s.scores.quality}%</td>
                                                    <td style={{ padding: '12px 16px', color: '#ccc' }}>{s.api.price}</td>
                                                    <td style={{ padding: '12px 16px', color: '#ccc' }}>{s.scores.reliability}%</td>
                                                    <td style={{ padding: '12px 16px', color: '#ccc' }}>{s.scores.latency}ms</td>
                                                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#5a9a5a' }}>{s.overall}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Rejected Providers */}
                            {decision.rejected.length > 0 && (
                                <div style={{
                                    borderRadius: 20,
                                    background: 'rgba(12,12,14,0.9)', border: '1px solid rgba(255,255,255,0.06)',
                                    overflow: 'hidden',
                                }}>
                                    <button
                                        onClick={() => setShowRejected(!showRejected)}
                                        style={{
                                            width: '100%', padding: '16px 24px', background: 'none', border: 'none',
                                            borderBottom: showRejected ? '1px solid rgba(255,255,255,0.04)' : 'none',
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            cursor: 'pointer', color: '#ddd',
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <Shield size={14} color="#c06060" />
                                            <span style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: 600 }}>Rejected Providers ({decision.rejected.length})</span>
                                        </div>
                                        {showRejected ? <ChevronUp size={14} color="#666" /> : <ChevronDown size={14} color="#666" />}
                                    </button>
                                    <AnimatePresence>
                                        {showRejected && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                style={{ overflow: 'hidden' }}
                                            >
                                                {decision.rejected.map(r => (
                                                    <div key={r.api.id} style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                                                        <div>
                                                            <div style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: 600, color: '#ccc' }}>{r.api.name}</div>
                                                            <div style={{ fontSize: 11, color: '#555', fontFamily: 'Inter' }}>{r.api.provider}</div>
                                                        </div>
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                                            {r.failedRules.map(f => (
                                                                <span key={f.rule} title={f.reason} style={{
                                                                    padding: '3px 8px', borderRadius: 6,
                                                                    background: 'rgba(180,60,60,0.1)', border: '1px solid rgba(180,60,60,0.2)',
                                                                    fontSize: 10, color: '#c06060', fontFamily: 'Inter',
                                                                }}>
                                                                    {f.rule}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            </main>
            <Footer />

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

// ─── Main Export (Suspense boundary for useSearchParams) ──

export default function AgentAdvisorPage() {
    return (
        <Suspense fallback={
            <div style={{ background: '#050505', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <Loader2 size={28} color="#5a9a5a" style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} />
                    <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#666' }}>Loading AI Advisor...</p>
                </div>
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
        }>
            <AgentAdvisorInner />
        </Suspense>
    );
}
