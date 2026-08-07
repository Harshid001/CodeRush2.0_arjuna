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
            {['#ff5f57','#ffbd2e','#27c93f'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.65 }} />)}
          </div>
          <span style={{ fontFamily: 'Inter', fontSize: 11, color: '#444' }}>API Analytics · Live</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 20, background: 'rgba(50,120,50,0.12)', border: '1px solid rgba(50,120,50,0.2)' }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#3d8a3d', display: 'block' }} />
            <span style={{ fontFamily: 'Inter', fontSize: 10, color: '#4a8a4a' }}>Live</span>
          </div>
        </div>

        {/* stat row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, background: 'rgba(255,255,255,0.04)' }}>
          {[{ l:'Requests', v:'2.4M', t:'+12%' }, { l:'Revenue', v:'$48.2K', t:'+8%' }, { l:'Uptime', v:'99.9%', t:'↑' }].map(s => (
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
            { n:'Vision Pro API', p:'OpenCore',   r:'480K' },
            { n:'Whisper STT',    p:'AudioAI',    r:'210K' },
            { n:'DataStream ML',  p:'NexusDB',    r:'890K' },
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
      <motion.div animate={{ y: [0,-6,0] }} transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
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
      <motion.div animate={{ y: [0,5,0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
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
  { icon: Globe,    title: 'Universal Discovery',   desc: 'Browse 12,000+ verified AI and data APIs across every domain — LLMs, vision, audio, specialized data, and more.' },
  { icon: Shield,   title: 'Trust & Verification',  desc: 'Every provider is vetted. Smart contracts ensure atomic payments with zero counterparty risk or hidden fees.' },
  { icon: Zap,      title: 'Pay-Per-Request',       desc: 'Granular usage billing at the request level. Pay for exactly what you consume — real-time metering, instant settlement.' },
  { icon: Code2,    title: 'Unified SDK',            desc: 'One SDK across all APIs. Consistent auth, error handling, and typed responses. Zero vendor lock-in, ever.' },
  { icon: BarChart3,'title': 'Usage Analytics',     desc: 'Deep cost optimization insights, latency patterns, request breakdowns, and trend analysis across your entire stack.' },
  { icon: Lock,     title: 'On-Chain Receipts',     desc: 'Immutable blockchain receipts for every transaction. Full audit trail, tax compliance, and verifiable payment history.' },
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
    transition: { duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  });

  return (
    <div style={{ background: '#050505', minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
      <Stars />
      <Navbar hideLinks={true} />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section style={{ ...S.section, minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: 80 }}>
        {/* hero glow */}
        <div style={{
          position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)',
          width: 800, height: 500, borderRadius: '50%', pointerEvents: 'none',
          background: 'radial-gradient(ellipse, rgba(80,100,200,0.07) 0%, transparent 70%)',
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
                <span style={{ fontFamily: 'Inter', fontSize: 12, color: '#555' }}>Now live — 12,000+ APIs · 800+ providers</span>
              </motion.div>

              {/* Headline */}
              <motion.h1 {...fadeUp(0.1)} style={{
                fontFamily: 'Playfair Display, Georgia, serif', fontWeight: 600,
                fontSize: 'clamp(2.8rem, 5vw, 4.2rem)', color: '#efefef',
                letterSpacing: '-0.03em', lineHeight: 1.07, marginBottom: 22,
              }}>
                The marketplace
                <br />
                <em style={{ fontStyle: 'italic', color: '#888' }}>intelligence</em> runs on.
              </motion.h1>

              {/* sub */}
              <motion.p {...fadeUp(0.2)} style={{ ...S.body, maxWidth: 420, marginBottom: 36 }}>
                Discover, compare, and purchase enterprise-grade AI and Data APIs.
                Pay per request or set usage caps — with blockchain-verified receipts and zero overhead.
              </motion.p>

              {/* CTAs */}
              <motion.div {...fadeUp(0.3)} style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <Link href="/marketplace" className="btn-primary">
                  Explore APIs <ArrowRight size={15} strokeWidth={2.5} />
                </Link>
                <Link href="/dashboard" className="btn-ghost">
                  View Dashboard
                </Link>
              </motion.div>

              {/* micro stats */}
              <motion.div {...fadeUp(0.45)} style={{ display: 'flex', gap: 36, marginTop: 48, paddingTop: 40, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                {[{ v:'12K+', l:'APIs' }, { v:'800+', l:'Providers' }, { v:'$2.4M', l:'Paid out' }, { v:'99.9%', l:'Uptime' }].map(s => (
                  <div key={s.l}>
                    <div style={{ fontFamily: 'Inter', fontSize: 20, fontWeight: 700, color: '#ddd', letterSpacing: '-0.03em' }}>{s.v}</div>
                    <div style={{ fontFamily: 'Inter', fontSize: 12, color: '#3a3a3a', marginTop: 2 }}>{s.l}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right — dashboard mockup */}
            <motion.div initial={{ opacity: 0, x: 48 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.25, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
              style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: 60 }}>
              <MockDashboard />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── TRUST ─────────────────────────────────────────────────────────── */}
      <section style={{ ...S.section, padding: '60px 0 80px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px' }}>
          <p style={{ ...S.label, textAlign: 'center', marginBottom: 40 }}>Trusted by leading AI teams</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 48, alignItems: 'center' }}>
            {['Anthropic','Mistral','Cohere','Replicate','Hugging Face','Together AI','Groq','Perplexity'].map(name => (
              <span key={name}
                style={{ fontFamily: 'Inter', fontSize: 16, fontWeight: 500, color: '#222', letterSpacing: '-0.01em', cursor: 'default', transition: 'color 0.3s, transform 0.3s', display: 'block' }}
                onMouseEnter={e => { (e.currentTarget as HTMLSpanElement).style.color = '#666'; (e.currentTarget as HTMLSpanElement).style.transform = 'scale(1.06)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLSpanElement).style.color = '#222'; (e.currentTarget as HTMLSpanElement).style.transform = 'scale(1)'; }}>
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────────── */}
      <section style={{ ...S.section, padding: '100px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px' }}>
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} style={{ marginBottom: 56 }}>
            <p style={{ ...S.label, marginBottom: 14 }}>Platform Capabilities</p>
            <h2 style={{ ...S.h2, maxWidth: 500 }}>Everything you need<br />to build with AI</h2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {feats.map((f, i) => (
              <motion.div key={f.title}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.55, delay: i * 0.07 }}
                className="card-hover"
                style={{
                  padding: '28px 26px', borderRadius: 20,
                  background: 'linear-gradient(145deg, rgba(22,22,26,0.9) 0%, rgba(12,12,14,0.9) 100%)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  boxShadow: '0 2px 24px rgba(0,0,0,0.4)',
                }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: 20,
                }}>
                  <f.icon size={19} color="#999" />
                </div>
                <h3 style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: 600, color: '#d8d8d8', marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#4a4a4a', lineHeight: 1.75 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────────────────────── */}
      <section style={{ ...S.section, padding: '80px 0 100px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px' }}>
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <div style={{
              position: 'relative', borderRadius: 28, padding: '80px 60px', textAlign: 'center', overflow: 'hidden',
              background: 'linear-gradient(145deg, rgba(20,20,26,0.95) 0%, rgba(10,10,12,0.95) 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 4px 80px rgba(0,0,0,0.6)',
            }}>
              {/* inner glow */}
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 60% at 50% 0%, rgba(80,100,200,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <p style={{ ...S.label, marginBottom: 20 }}>Get Started Today</p>
                <h2 style={{ ...S.h2, fontSize: 'clamp(2rem, 3.5vw, 3rem)', marginBottom: 18 }}>
                  Start building with the<br />
                  <em style={{ color: '#666', fontStyle: 'italic' }}>world&apos;s best APIs</em>
                </h2>
                <p style={{ ...S.body, maxWidth: 400, margin: '0 auto 36px', color: '#444' }}>
                  Join 40,000+ developers and enterprises powering their AI stack with NexusAPI.
                </p>
                <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link href="/marketplace" className="btn-primary">
                    Browse Marketplace <ArrowRight size={14} />
                  </Link>
                  <Link href="/dashboard" className="btn-ghost">
                    View Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────────────── */}
      <section style={{ ...S.section, padding: '20px 0 100px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }} className="grid-cols-1 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div key={t.name}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                style={{
                  padding: '28px 26px', borderRadius: 20,
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 18 }}>
                  {Array(5).fill(0).map((_, j) => <Star key={j} size={11} fill="#3a3a3a" color="#3a3a3a" />)}
                </div>
                <p style={{ fontFamily: 'Inter', fontSize: 13.5, color: '#555', lineHeight: 1.8, fontStyle: 'italic', marginBottom: 20 }}>{t.q}</p>
                <div>
                  <div style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: 600, color: '#888' }}>{t.name}</div>
                  <div style={{ fontFamily: 'Inter', fontSize: 12, color: '#333', marginTop: 2 }}>{t.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
