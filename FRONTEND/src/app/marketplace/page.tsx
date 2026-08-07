'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import {
  Search, Star, Brain, Eye, Mic, Code2, Activity, Database, Globe, Zap,
  ChevronDown, SlidersHorizontal, LayoutGrid, List
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CatalogTable, { CatalogItem } from '@/components/CatalogTable';
import Link from 'next/link';
import { apis } from '@/lib/data/marketplaceApis';
import ModeSelector from '@/components/ModeSelector';

const ICONS: Record<string, React.ElementType> = { brain: Brain, eye: Eye, mic: Mic, code: Code2, activity: Activity, database: Database, globe: Globe, zap: Zap };

const CATS = ['All', 'OCR', 'Translation', 'Embeddings', 'Text Generation', 'Speech-to-Text', 'Image Generation', 'Moderation', 'Risk Scoring', 'Geocoding', 'Sentiment Analysis', 'Language Models', 'Computer Vision', 'Audio & Speech', 'Data & Analytics', 'Code & Dev'];
const CHAINS = ['All', 'Ethereum', 'Solana', 'Polygon', 'Arbitrum', 'Base'];
const MODELS = ['All', 'Pay-per-Request', 'Usage Cap', 'Freemium'];

function Drop({ label, opts, val, set }: { label: string; opts: string[]; val: string; set: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const active = val !== 'All';
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)} style={{
        display: 'flex', alignItems: 'center', gap: 7, padding: '9px 14px',
        borderRadius: 11, border: `1px solid ${active ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.08)'}`,
        background: active ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)',
        color: active ? '#ccc' : '#555', fontFamily: 'Inter', fontSize: 13, cursor: 'pointer',
        transition: 'all 0.2s',
      }}>
        <span>{active ? val : label}</span>
        <ChevronDown size={12} style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.97 }} transition={{ duration: 0.15 }}
            style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, minWidth: 180, borderRadius: 14, overflow: 'hidden', zIndex: 50, background: '#101012', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 24px 48px rgba(0,0,0,0.6)' }}>
            {opts.map(o => (
              <button key={o} onClick={() => { set(o); setOpen(false); }} style={{
                width: '100%', textAlign: 'left', padding: '11px 16px', border: 'none', cursor: 'pointer',
                fontFamily: 'Inter', fontSize: 13, transition: 'background 0.15s',
                background: val === o ? 'rgba(255,255,255,0.07)' : 'transparent',
                color: val === o ? '#e0e0e0' : '#666',
              }}
                onMouseEnter={e => { if (val !== o) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={e => { if (val !== o) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}>
                {o}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ApiCard({ a, i }: { a: typeof apis[0]; i: number }) {
  const Icon = ICONS[a.icon] || Database;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.04 }}
      className="card-hover"
      style={{
        borderRadius: 20, overflow: 'hidden', position: 'relative',
        background: 'linear-gradient(155deg, rgba(22,22,26,0.95) 0%, rgba(12,12,14,0.95) 100%)',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 4px 32px rgba(0,0,0,0.5)',
      }}>
      {a.featured && (
        <div style={{
          position: 'absolute', top: 14, right: 14,
          padding: '3px 10px', borderRadius: 100,
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
          fontFamily: 'Inter', fontSize: 11, color: '#555',
        }}>Featured</div>
      )}

      <div style={{ padding: '24px 22px' }}>
        {/* header */}
        <div style={{ display: 'flex', gap: 13, alignItems: 'flex-start', marginBottom: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon size={18} color="#888" />
          </div>
          <div style={{ minWidth: 0 }}>
            <h3 style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: 600, color: '#e0e0e0', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</h3>
            <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#444' }}>{a.provider}</p>
          </div>
        </div>

        {/* rating & quality score */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ display: 'flex', gap: 2 }}>
              {Array(5).fill(0).map((_, j) => <Star key={j} size={10} fill={j < Math.floor(a.rating) ? '#555' : 'transparent'} color="#555" />)}
            </div>
            <span style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 600, color: '#666' }}>{a.rating}</span>
          </div>
          <span style={{ fontFamily: 'Inter', fontSize: 11, color: '#5a9a5a', background: 'rgba(74,138,74,0.1)', padding: '2px 8px', borderRadius: 100, border: '1px solid rgba(74,138,74,0.2)' }}>
            Score: {a.qualityScore}%
          </span>
        </div>

        {/* desc */}
        <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#4a4a4a', lineHeight: 1.7, marginBottom: 18, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {a.desc}
        </p>

        {/* pricing */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', marginBottom: 14 }}>
          <div>
            <div style={{ fontFamily: 'Inter', fontSize: 10, color: '#333', marginBottom: 3 }}>Per request</div>
            <div style={{ fontFamily: 'Inter', fontSize: 15, fontWeight: 700, color: '#ccc', letterSpacing: '-0.02em' }}>{a.price}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'Inter', fontSize: 10, color: '#333', marginBottom: 3 }}>Usage cap</div>
            <div style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 500, color: '#666' }}>{a.cap}</div>
          </div>
        </div>

        {/* badges */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <span style={{ padding: '4px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', fontFamily: 'Inter', fontSize: 11, color: '#444' }}>{a.chain}</span>
          <span style={{ fontFamily: 'Inter', fontSize: 11, color: '#333' }}>{a.model}</span>
        </div>

        {/* CTA */}
        <Link href={`/providers/${a.id}`} style={{ textDecoration: 'none' }}>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} style={{
            width: '100%', padding: '11px', borderRadius: 13, border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.06)', color: '#bbb',
            fontFamily: 'Inter', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            transition: 'background 0.2s, color 0.2s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.11)'; (e.currentTarget as HTMLButtonElement).style.color = '#eee'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLButtonElement).style.color = '#bbb'; }}>
            View &amp; Purchase
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
}

export default function MarketplacePage() {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  const [chain, setChain] = useState('All');
  const [model, setModel] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const filtered = apis.filter(a =>
    (a.name + a.provider + a.desc + a.rawDescription).toLowerCase().includes(q.toLowerCase()) &&
    (cat === 'All' || a.cat === cat) &&
    (chain === 'All' || a.chain === chain) &&
    (model === 'All' || a.model === model)
  );

  return (
    <div style={{ background: '#050505', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ paddingTop: 100, paddingBottom: 120 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px' }}>
          
          {/* Mode Switcher */}
          <ModeSelector currentMode="manual" />

          {/* header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ marginBottom: 48 }}>
            <p style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#444', marginBottom: 12 }}>API Marketplace</p>
            <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontWeight: 600, fontSize: 'clamp(2.2rem,4vw,3.2rem)', color: '#efefef', letterSpacing: '-0.025em', marginBottom: 8 }}>
              Discover world-class APIs
            </h1>
            <p style={{ fontFamily: 'Inter', fontSize: 14, color: '#444' }}>{apis.length} APIs · {new Set(apis.map(a => a.provider)).size} verified providers</p>
          </motion.div>

          {/* search & view toggle */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderRadius: 16,
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 2px 24px rgba(0,0,0,0.3)', flex: 1,
              }}>
                <Search size={17} color="#333" style={{ flexShrink: 0 }} />
                <input value={q} onChange={e => setQ(e.target.value)}
                  type="text" placeholder="Search APIs by name, capability, provider, or raw payload…"
                  style={{ flex: 1, border: 'none', fontSize: 14, background: 'transparent', color: '#e0e0e0', fontFamily: 'Inter' }} />
                {q && <button onClick={() => setQ('')} style={{ fontFamily: 'Inter', fontSize: 12, color: '#444', background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 7, padding: '4px 10px', cursor: 'pointer' }}>Clear</button>}
              </div>

              {/* View Mode Toggle Button Group */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: 4,
                  borderRadius: 14,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  gap: 4,
                }}
              >
                <button
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    border: 'none',
                    background: viewMode === 'grid' ? 'rgba(255,255,255,0.12)' : 'transparent',
                    color: viewMode === 'grid' ? '#ffffff' : '#555555',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <LayoutGrid size={17} />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  title="Table View (Prompt Injection & Audit Mode)"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    border: 'none',
                    background: viewMode === 'table' ? 'rgba(255,255,255,0.12)' : 'transparent',
                    color: viewMode === 'table' ? '#ffffff' : '#555555',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <List size={17} />
                </button>
              </div>
            </div>
          </motion.div>

          {/* filters */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.15 }}
            style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 36 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 11, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: '#555', fontFamily: 'Inter', fontSize: 13 }}>
              <SlidersHorizontal size={13} /> Filters
            </div>
            <Drop label="Category" opts={CATS} val={cat} set={setCat} />
            <Drop label="Blockchain" opts={CHAINS} val={chain} set={setChain} />
            <Drop label="Pricing" opts={MODELS} val={model} set={setModel} />
            {[cat, chain, model].some(v => v !== 'All') && (
              <button onClick={() => { setCat('All'); setChain('All'); setModel('All'); }} style={{ fontFamily: 'Inter', fontSize: 12, color: '#555', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 12px', borderRadius: 8, transition: 'color 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#888'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#555'; }}>
                Clear filters
              </button>
            )}
            <span style={{ marginLeft: 'auto', fontFamily: 'Inter', fontSize: 13, color: '#333' }}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
          </motion.div>

          {/* Content (Grid or Table) */}
          <AnimatePresence mode="popLayout">
            {filtered.length > 0 ? (
              viewMode === 'grid' ? (
                <motion.div key="grid-view" layout style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }} className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((a, i) => <ApiCard key={a.id} a={a} i={i} />)}
                </motion.div>
              ) : (
                <motion.div key="table-view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <CatalogTable items={filtered as CatalogItem[]} />
                </motion.div>
              )
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '96px 0' }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Search size={20} color="#333" />
                </div>
                <h3 style={{ fontFamily: 'Inter', fontSize: 16, color: '#444', marginBottom: 6 }}>No APIs found</h3>
                <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#2a2a2a' }}>Try adjusting your search or filters</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </div>
  );
}
