'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Zap, Shield, Globe, TrendingUp, ChevronDown,
  Rocket, DollarSign, Users, Lock,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProviderRegistrationForm from '@/components/provider/ProviderRegistrationForm';
import ProviderPreview from '@/components/provider/ProviderPreview';
import type { Provider } from '@/types/provider';

/* ─── FAQ data ─── */
const FAQ_ITEMS = [
  {
    q: 'How does pricing work for providers?',
    a: 'You set your own price per request. Choose "Exact" for a fixed fee or "Up To" for a metered cap. Payments are settled on-chain per x402 protocol.',
  },
  {
    q: 'What are the requirements to list an API?',
    a: 'A production-ready HTTPS endpoint, valid JSON schemas for input/output, and compliance with our Terms of Service. We recommend uptime above 99%.',
  },
  {
    q: 'How do I receive payments?',
    a: 'Payments are routed to your wallet address on the selected network. Settlements happen automatically via the x402 facilitator after each verified request.',
  },
  {
    q: 'Can I update my listing after publishing?',
    a: 'Yes. You can modify pricing, description, schemas, and rate limits at any time from your provider dashboard (coming soon).',
  },
];

/* ─── Benefits data ─── */
const BENEFITS = [
  {
    icon: DollarSign,
    title: 'Instant Monetization',
    desc: 'Start earning per-request revenue from day one. No invoicing, no billing headaches.',
  },
  {
    icon: Globe,
    title: 'Global Reach',
    desc: 'Expose your API to thousands of developers and AI agents on the marketplace.',
  },
  {
    icon: Shield,
    title: 'On-Chain Settlements',
    desc: 'Transparent, trustless payments via x402 protocol. Verified and settled automatically.',
  },
  {
    icon: Rocket,
    title: 'Zero Infrastructure Overhead',
    desc: 'We handle discovery, metering, and payment flows. You focus on your API.',
  },
];

/* ─── FAQ Accordion Item ─── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        borderRadius: 14,
        border: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(255,255,255,0.02)',
        overflow: 'hidden',
        transition: 'border-color 0.2s',
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'Inter, sans-serif',
          fontSize: 14,
          fontWeight: 500,
          color: '#ccc',
          textAlign: 'left',
        }}
      >
        {q}
        <ChevronDown
          size={16}
          color="#555"
          style={{
            transition: 'transform 0.25s',
            transform: open ? 'rotate(180deg)' : 'none',
            flexShrink: 0,
          }}
        />
      </button>
      {open && (
        <div
          style={{
            padding: '0 20px 16px',
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            color: '#666',
            lineHeight: 1.7,
          }}
        >
          {a}
        </div>
      )}
    </div>
  );
}

/* ─── Page ─── */
export default function BecomeProviderPage() {
  const [providers, setProviders] = useState<Provider[]>([]);

  const handleProviderSubmit = (provider: Provider) => {
    setProviders((prev) => [provider, ...prev]);
  };

  return (
    <div style={{ background: '#050505', minHeight: '100vh' }}>
      <Navbar />

      <main style={{ paddingTop: 100, paddingBottom: 120 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px' }}>

          {/* ═══ HERO ═══ */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            style={{ textAlign: 'center', marginBottom: 80 }}
          >
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '5px 14px', borderRadius: 100,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              fontFamily: 'Inter', fontSize: 11, fontWeight: 600, color: '#555',
              letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 20,
            }}>
              <Zap size={12} /> Provider Program
            </div>
            <h1 style={{
              fontFamily: 'Playfair Display, Georgia, serif',
              fontWeight: 600,
              fontSize: 'clamp(2.4rem, 5vw, 3.6rem)',
              color: '#efefef',
              letterSpacing: '-0.025em',
              marginBottom: 16,
              lineHeight: 1.15,
            }}>
              Turn your API into a<br />
              <span style={{ color: '#888' }}>revenue stream</span>
            </h1>
            <p style={{
              fontFamily: 'Inter', fontSize: 15, color: '#555',
              maxWidth: 520, margin: '0 auto', lineHeight: 1.7,
            }}>
              List your API on the marketplace, set your price, and start earning
              on every request — powered by trustless on-chain settlements.
            </p>
          </motion.section>

          {/* ═══ BENEFITS ═══ */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            style={{ marginBottom: 80 }}
          >
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 16,
            }}>
              {BENEFITS.map((b, i) => {
                const Icon = b.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                    className="card-hover"
                    style={{
                      padding: '24px',
                      borderRadius: 18,
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div style={{
                      width: 38, height: 38, borderRadius: 11,
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
                    }}>
                      <Icon size={17} color="#777" />
                    </div>
                    <h3 style={{
                      fontFamily: 'Inter', fontSize: 14, fontWeight: 600, color: '#ccc', marginBottom: 6,
                    }}>
                      {b.title}
                    </h3>
                    <p style={{
                      fontFamily: 'Inter', fontSize: 12, color: '#555', lineHeight: 1.65,
                    }}>
                      {b.desc}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>

          {/* ═══ REGISTRATION FORM + PREVIEW ═══ */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            style={{ marginBottom: 80 }}
          >
            <div style={{ marginBottom: 32 }}>
              <p style={{
                fontFamily: 'Inter', fontSize: 11, fontWeight: 600,
                letterSpacing: '0.12em', textTransform: 'uppercase', color: '#444', marginBottom: 10,
              }}>
                Register Your API
              </p>
              <h2 style={{
                fontFamily: 'Playfair Display, Georgia, serif',
                fontWeight: 600, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                color: '#efefef', letterSpacing: '-0.02em',
              }}>
                Fill out the details below
              </h2>
            </div>

            {/* Mobile preview placeholder (shown above form on small screens) */}
            <div className="provider-preview-mobile" style={{ marginBottom: 24, display: 'none' }}>
              {/* Will be CSS-enabled on mobile */}
            </div>

            <ProviderRegistrationForm
              onSubmit={handleProviderSubmit}
              renderPreview={(values) => <ProviderPreview data={values} />}
            />
          </motion.section>

          {/* ═══ RECENTLY REGISTERED (if any) ═══ */}
          {providers.length > 0 && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ marginBottom: 80 }}
            >
              <h2 style={{
                fontFamily: 'Inter', fontSize: 14, fontWeight: 600, color: '#888', marginBottom: 16,
              }}>
                Recently Registered ({providers.length})
              </h2>
              <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
                {providers.slice(0, 5).map((p) => (
                  <div
                    key={p.id}
                    style={{
                      flex: '0 0 260px',
                      padding: '16px 18px',
                      borderRadius: 14,
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <h4 style={{
                      fontFamily: 'Inter', fontSize: 13, fontWeight: 600, color: '#ccc', marginBottom: 4,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {p.providerName}
                    </h4>
                    <p style={{ fontFamily: 'Inter', fontSize: 11, color: '#555', marginBottom: 8 }}>
                      {p.companyName} · {p.category}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Inter', fontSize: 11 }}>
                      <span style={{ color: '#666' }}>${p.pricePerRequest.toFixed(4)}/req</span>
                      <span style={{ color: '#5a9a5a' }}>{p.qualityScore}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* ═══ FAQ ═══ */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{ marginBottom: 80, maxWidth: 720, margin: '0 auto 80px' }}
          >
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <p style={{
                fontFamily: 'Inter', fontSize: 11, fontWeight: 600,
                letterSpacing: '0.12em', textTransform: 'uppercase', color: '#444', marginBottom: 10,
              }}>
                FAQ
              </p>
              <h2 style={{
                fontFamily: 'Playfair Display, Georgia, serif',
                fontWeight: 600, fontSize: 'clamp(1.4rem, 2.5vw, 1.8rem)',
                color: '#efefef', letterSpacing: '-0.02em',
              }}>
                Common questions
              </h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {FAQ_ITEMS.map((item, i) => (
                <FaqItem key={i} q={item.q} a={item.a} />
              ))}
            </div>
          </motion.section>

        </div>
      </main>

      <Footer />

      {/* ═══ Responsive CSS for mobile preview / desktop preview ═══ */}
      <style>{`
        @media (max-width: 860px) {
          .provider-preview-desktop { display: none !important; }
          .provider-preview-mobile { display: block !important; }
        }
        @media (min-width: 861px) {
          .provider-preview-mobile { display: none !important; }
        }
      `}</style>
    </div>
  );
}
