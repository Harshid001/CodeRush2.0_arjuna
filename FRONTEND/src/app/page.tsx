'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight, Shield, Zap, Globe, Code2, BarChart3, Lock,
  Star, TrendingUp, Activity, Database,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Stars from '@/components/ParticleBackground';

/* ─── tiny helpers ─────────────────────────────────────────────────────── */
const S = {
  section: { position: 'relative' as const, zIndex: 1 },
  label: {
    fontFamily: 'Inter', fontSize: 11, fontWeight: 600,
    letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#444',
  },
  h2: {
    fontFamily: 'Playfair Display, Georgia, serif', fontWeight: 600,
    fontSize: 'clamp(1.9rem, 3.2vw, 2.8rem)', color: '#efefef',
    letterSpacing: '-0.025em', lineHeight: 1.12,
  },
  body: { fontFamily: 'Inter', fontSize: 15, color: '#555', lineHeight: 1.8 },
};

/* ─── Dashboard Mockup ─────────────────────────────────────────────────── */
function MockDashboard() {
  const bar = [28, 52, 38, 68, 44, 82, 58, 88, 64, 72, 78, 94];
  return (
    <motion.div
      className="animate-float"
      style={{ position: 'relative', width: 340 }}
    >
      {/* main card */}
      <div style={{
        borderRadius: 20, overflow: 'hidden',
        background: 'linear-gradient(160deg, rgba(22,22,28,0.97) 0%, rgba(12,12,14,0.97) 100%)',
        border: '1px solid rgba(255,255,255,0.09)',
        boxShadow: '0 48px 96px rgba(0,0,0,0.85), 0 0 80px rgba(100,130,220,0.05)',
      }}>
        {/* titlebar */}
        <div style={{ padding: '13px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {['#ff5f57', '#ffbd2e', '#27c93f'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.65 }} />)}
          </div>
          <span style={{ fontFamily: 'Inter', fontSize: 11, color: '#444' }}>API Analytics · Live</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 20, background: 'rgba(50,120,50,0.12)', border: '1px solid rgba(50,120,50,0.2)' }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#3d8a3d', display: 'block' }} />
            <span style={{ fontFamily: 'Inter', fontSize: 10, color: '#4a8a4a' }}>Live</span>
          </div>
        </div>

        {/* stat row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, background: 'rgba(255,255,255,0.04)' }}>
          {[{ l: 'Requests', v: '2.4M', t: '+12%' }, { l: 'Revenue', v: '$48.2K', t: '+8%' }, { l: 'Uptime', v: '99.9%', t: '↑' }].map(s => (
            <div key={s.l} style={{ padding: '14px 16px', background: 'rgba(12,12,14,0.97)' }}>
              <div style={{ fontFamily: 'Inter', fontSize: 10, color: '#3a3a3a', marginBottom: 4 }}>{s.l}</div>
              <div style={{ fontFamily: 'Inter', fontSize: 15, fontWeight: 600, color: '#e0e0e0', letterSpacing: '-0.02em' }}>{s.v}</div>
              <div style={{ fontFamily: 'Inter', fontSize: 10, color: '#3a7a3a', marginTop: 2 }}>{s.t}</div>
            </div>
          ))}
        </div>

        {/* chart */}
        <div style={{ padding: '18px 18px 6px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 64 }}>
            {bar.map((h, i) => (
              <motion.div key={i}
                initial={{ height: 0 }} animate={{ height: `${h}%` }}
                transition={{ duration: 0.7, delay: 0.05 * i, ease: 'easeOut' }}
                style={{ flex: 1, borderRadius: 3, background: `rgba(160,185,255,${0.07 + i * 0.012})` }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <span style={{ fontFamily: 'Inter', fontSize: 9, color: '#2a2a2a' }}>Jan</span>
            <span style={{ fontFamily: 'Inter', fontSize: 9, color: '#2a2a2a' }}>Dec</span>
          </div>
        </div>

        {/* api list */}
        <div style={{ padding: '10px 14px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { n: 'Vision Pro API', p: 'OpenCore', r: '480K' },
            { n: 'Whisper STT', p: 'AudioAI', r: '210K' },
            { n: 'DataStream ML', p: 'NexusDB', r: '890K' },
          ].map(a => (
            <div key={a.n} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '9px 11px', borderRadius: 12,
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{ width: 26, height: 26, borderRadius: 8, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Database size={11} color="#666" />
                </div>
                <div>
                  <div style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 500, color: '#c0c0c0' }}>{a.n}</div>
                  <div style={{ fontFamily: 'Inter', fontSize: 10, color: '#3a3a3a' }}>{a.p}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 500, color: '#777' }}>{a.r}</div>
                <div style={{ fontFamily: 'Inter', fontSize: 9, color: '#3a6a3a' }}>active</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* floating badge top-right */}
      <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
        style={{
          position: 'absolute', top: 40, right: -52,
          padding: '10px 14px', borderRadius: 14,
          background: 'rgba(14,14,16,0.96)', border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 16px 48px rgba(0,0,0,0.65)',
        }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <TrendingUp size={11} color="#4a8a4a" />
          <span style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 600, color: '#4a8a4a' }}>+24.8%</span>
        </div>
        <div style={{ fontFamily: 'Inter', fontSize: 10, color: '#2a2a2a' }}>API Revenue</div>
      </motion.div>

      {/* floating badge bottom-left */}
      <motion.div animate={{ y: [0, 5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
        style={{
          position: 'absolute', bottom: 60, left: -48,
          padding: '10px 14px', borderRadius: 14,
          background: 'rgba(14,14,16,0.96)', border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 16px 48px rgba(0,0,0,0.65)',
        }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
          <Activity size={10} color="#666" />
          <span style={{ fontFamily: 'Inter', fontSize: 10, color: '#444' }}>Latency</span>
        </div>
        <div style={{ fontFamily: 'Inter', fontSize: 16, fontWeight: 700, color: '#d0d0d0', letterSpacing: '-0.03em' }}>18ms</div>
        <div style={{ fontFamily: 'Inter', fontSize: 9, color: '#3a3a3a' }}>avg response</div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Feature cards ────────────────────────────────────────────────────── */
const feats = [
  { icon: Globe, title: 'Universal Discovery', desc: 'Browse 12,000+ verified AI and data APIs across every domain — LLMs, vision, audio, specialized data, and more.' },
  { icon: Shield, title: 'Trust & Verification', desc: 'Every provider is vetted. Smart contracts ensure atomic payments with zero counterparty risk or hidden fees.' },
  { icon: Zap, title: 'Pay-Per-Request', desc: 'Granular usage billing at the request level. Pay for exactly what you consume — real-time metering, instant settlement.' },
  { icon: Code2, title: 'Unified SDK', desc: 'One SDK across all APIs. Consistent auth, error handling, and typed responses. Zero vendor lock-in, ever.' },
  { icon: BarChart3, 'title': 'Usage Analytics', desc: 'Deep cost optimization insights, latency patterns, request breakdowns, and trend analysis across your entire stack.' },
  { icon: Lock, title: 'On-Chain Receipts', desc: 'Immutable blockchain receipts for every transaction. Full audit trail, tax compliance, and verifiable payment history.' },
];

/* ─── Testimonials ─────────────────────────────────────────────────────── */
const testimonials = [
  { q: '"NexusAPI cut our AI infra costs by 60% while improving reliability. The pay-per-request model is exactly what modern teams need."', name: 'Sarah Chen', role: 'CTO, Lumina AI' },
  { q: '"Best API marketplace we\'ve used. Onboarding took 10 minutes. Blockchain receipts are genuinely useful for accounting."', name: 'Marcus Rivera', role: 'Head of Eng, Volta Systems' },
  { q: '"As a provider, revenue tripled in 3 months. The analytics are incredibly granular and payouts are instant."', name: 'Aiko Tanaka', role: 'Founder, CogniStream' },
];

/* ─── Page ─────────────────────────────────────────────────────────────── */
export default function Home() {
  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <div style={{ background: '#050505', minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>

      {/* ── HIGH-END ETHEREAL FLUID BACKGROUND IMAGE ─────────────────────── */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '110vh',
          backgroundImage: `url('/hero-bg.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
          opacity: 0.45,
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 100%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <Stars />
      <Navbar hideLinks={true} showWallet={false} />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section style={{ ...S.section, minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: 80 }}>
        {/* hero glow */}
        <div style={{
          position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)',
          width: 800, height: 500, borderRadius: '50%', pointerEvents: 'none',
          background: 'radial-gradient(ellipse, rgba(80,100,200,0.08) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px', width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center', padding: '60px 0' }}
            className="grid-cols-1 lg:grid-cols-2">

            {/* Left */}
            <div>
              {/* pill badge */}
              <motion.div {...fadeUp(0)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 14px', borderRadius: 100, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: 32 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3d8a3d', display: 'block', boxShadow: '0 0 8px rgba(60,140,60,0.8)' }} />
                <span style={{ fontFamily: 'Inter', fontSize: 12, color: '#666' }}>Now live — 12,000+ APIs · 800+ providers</span>
              </motion.div>

              {/* Headline */}
              <motion.h1 {...fadeUp(0.1)} style={{
                fontFamily: 'Playfair Display, Georgia, serif', fontWeight: 600,
                fontSize: 'clamp(2.6rem, 4.8vw, 4.2rem)', color: '#ffffff',
                letterSpacing: '-0.03em', lineHeight: 1.08, marginBottom: 24,
              }}>
                The Premier Marketplace for <span style={{ color: '#d8d8d8', fontStyle: 'italic', fontWeight: 400 }}>AI & Data APIs</span>
              </motion.h1>

              {/* Subheadline */}
              <motion.p {...fadeUp(0.2)} style={{ ...S.body, maxWidth: 480, marginBottom: 40, color: '#888' }}>
                Discover, integrate, and monetize next-generation APIs. Pay-per-request billing backed by smart contracts, transparent SLAs, and zero friction.
              </motion.p>

              {/* CTAs */}
              <motion.div {...fadeUp(0.3)} style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                <Link href="/marketplace" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '14px 28px', borderRadius: 13,
                  background: '#f0f0f0', color: '#050505',
                  fontFamily: 'Inter', fontWeight: 600, fontSize: 14, textDecoration: 'none',
                  boxShadow: '0 4px 24px rgba(255,255,255,0.12)', transition: 'all 0.25s ease',
                }}
                  onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => { (e.currentTarget as HTMLAnchorElement).style.background = '#ffffff'; (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => { (e.currentTarget as HTMLAnchorElement).style.background = '#f0f0f0'; (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)'; }}
                >
                  Explore Marketplace <ArrowRight size={15} />
                </Link>

                <Link href="/dashboard" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '14px 24px', borderRadius: 13,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#999', fontFamily: 'Inter', fontWeight: 500, fontSize: 14, textDecoration: 'none',
                  transition: 'all 0.25s ease',
                }}
                  onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.2)'; (e.currentTarget as HTMLAnchorElement).style.color = '#e0e0e0'; }}
                  onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLAnchorElement).style.color = '#999'; }}
                >
                  View Dashboard
                </Link>
              </motion.div>
            </div>

            {/* Right: Mockup */}
            <motion.div {...fadeUp(0.25)} style={{ display: 'flex', justifyContent: 'center' }}>
              <MockDashboard />
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────────────────────── */}
      <section style={{ ...S.section, borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.015)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '36px 28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32 }} className="grid-cols-2 lg:grid-cols-4">
            {[
              { val: '12,000+', lbl: 'Active APIs' },
              { val: '$14.2M+', lbl: 'Volume Settled' },
              { val: '99.99%', lbl: 'Network Uptime' },
              { val: '<18ms', lbl: 'Avg Response' },
            ].map((st, i) => (
              <motion.div key={st.lbl} {...fadeUp(i * 0.08)} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 600, color: '#f0f0f0', letterSpacing: '-0.03em', marginBottom: 4 }}>
                  {st.val}
                </div>
                <div style={{ fontFamily: 'Inter', fontSize: 12, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {st.lbl}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────── */}
      <section style={{ ...S.section, padding: '120px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px' }}>

          <div style={{ textAlign: 'center', marginBottom: 72 }}>
            <motion.p {...fadeUp(0)} style={{ ...S.label, marginBottom: 12 }}>Platform Capabilities</motion.p>
            <motion.h2 {...fadeUp(0.1)} style={{ ...S.h2, maxWidth: 560, margin: '0 auto' }}>
              Built for High-Scale API Architecture
            </motion.h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }} className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {feats.map((f, i) => (
              <motion.div key={f.title} {...fadeUp(i * 0.07)}
                className="card-hover"
                style={{
                  padding: '32px 28px', borderRadius: 20,
                  background: 'linear-gradient(155deg, rgba(18,18,22,0.95) 0%, rgba(10,10,12,0.95) 100%)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  display: 'flex', flexDirection: 'column', gap: 16,
                }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <f.icon size={18} color="#aaa" />
                </div>
                <h3 style={{ fontFamily: 'Inter', fontSize: 16, fontWeight: 600, color: '#e8e8e8', letterSpacing: '-0.01em' }}>
                  {f.title}
                </h3>
                <p style={{ ...S.body, fontSize: 14 }}>
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────────────── */}
      <section style={{ ...S.section, padding: '0 0 120px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px' }}>
          <div style={{ textAlign: 'center', marginBottom: 72 }}>
            <motion.p {...fadeUp(0)} style={{ ...S.label, marginBottom: 12 }}>Trusted by Builders</motion.p>
            <motion.h2 {...fadeUp(0.1)} style={{ ...S.h2 }}>What Engineering Teams Say</motion.h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }} className="grid-cols-1 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} {...fadeUp(i * 0.09)} style={{
                padding: '32px 28px', borderRadius: 20,
                background: 'rgba(14,14,16,0.95)', border: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 24,
              }}>
                <div style={{ display: 'flex', gap: 3 }}>
                  {[...Array(5)].map((_, k) => <Star key={k} size={12} color="#aaa" fill="#aaa" />)}
                </div>
                <p style={{ fontFamily: 'Inter', fontSize: 14, color: '#777', lineHeight: 1.7, fontStyle: 'italic' }}>
                  {t.q}
                </p>
                <div>
                  <div style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: 600, color: '#d8d8d8' }}>{t.name}</div>
                  <div style={{ fontFamily: 'Inter', fontSize: 11, color: '#3a3a3a', marginTop: 2 }}>{t.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────────────────────── */}
      <section style={{ ...S.section, padding: '0 0 120px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px' }}>
          <motion.div {...fadeUp(0)} style={{
            borderRadius: 28, padding: '72px 48px', textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(22,22,30,0.98) 0%, rgba(10,10,14,0.98) 100%)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: '-50%', left: '50%', transform: 'translateX(-50%)',
              width: 600, height: 400, borderRadius: '50%', pointerEvents: 'none',
              background: 'radial-gradient(ellipse, rgba(160,185,255,0.06) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }} />

            <motion.p {...fadeUp(0.1)} style={{ ...S.label, marginBottom: 16 }}>Start in Minutes</motion.p>
            <motion.h2 {...fadeUp(0.2)} style={{ ...S.h2, fontSize: 'clamp(2.2rem, 3.8vw, 3.2rem)', marginBottom: 20 }}>
              Ready to Accelerate Your API Ecosystem?
            </motion.h2>
            <motion.p {...fadeUp(0.3)} style={{ ...S.body, maxWidth: 500, margin: '0 auto 40px', color: '#888' }}>
              Join thousands of developers and teams leveraging NexusAPI for seamless discovery, billing, and analytics.
            </motion.p>
            <motion.div {...fadeUp(0.4)}>
              <Link href="/marketplace" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '16px 36px', borderRadius: 14,
                background: '#f0f0f0', color: '#050505',
                fontFamily: 'Inter', fontWeight: 600, fontSize: 15, textDecoration: 'none',
                boxShadow: '0 4px 24px rgba(255,255,255,0.14)', transition: 'all 0.25s ease',
              }}
                onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => { (e.currentTarget as HTMLAnchorElement).style.background = '#ffffff'; (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1.03)'; }}
                onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => { (e.currentTarget as HTMLAnchorElement).style.background = '#f0f0f0'; (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1)'; }}
              >
                Browse Marketplace <ArrowRight size={16} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
