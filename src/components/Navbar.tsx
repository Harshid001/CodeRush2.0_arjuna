'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Wallet, User, Menu, X, Zap } from 'lucide-react';

const links = [
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'Providers',   href: '/dashboard/provider' },
  { label: 'Pricing',     href: '#pricing' },
  { label: 'Docs',        href: '#' },
  { label: 'Resources',   href: '#' },
];

export default function Navbar({ hideLinks = false }: { hideLinks?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          transition: 'background 0.4s, backdrop-filter 0.4s, border-color 0.4s',
          background: scrolled ? 'rgba(5,5,5,0.88)' : 'transparent',
          backdropFilter: scrolled ? 'blur(28px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(28px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>

          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
            <div style={{
              width: 30, height: 30, borderRadius: 9,
              background: 'linear-gradient(135deg, #e8e8e8 0%, #888 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 18px rgba(200,210,255,0.18)',
            }}>
              <Zap size={14} color="#050505" strokeWidth={2.8} />
            </div>
            <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 15, color: '#f0f0f0', letterSpacing: '-0.02em' }}>
              NexusAPI
            </span>
          </Link>

          {/* Center links */}
          {!hideLinks && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }} className="hidden lg:flex">
              {links.map(l => (
                <Link key={l.label} href={l.href} style={{
                  fontFamily: 'Inter', fontSize: 13.5, fontWeight: 500, color: '#666',
                  padding: '7px 14px', borderRadius: 10, textDecoration: 'none',
                  transition: 'color 0.2s, background 0.2s',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#ddd'; (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.05)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#666'; (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; }}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          )}

          {/* Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }} className="hidden lg:flex">
            <button onClick={() => setSearchOpen(true)} style={{
              width: 34, height: 34, borderRadius: 10, border: 'none', background: 'rgba(255,255,255,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              color: '#555', transition: 'background 0.2s, color 0.2s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLButtonElement).style.color = '#aaa'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLButtonElement).style.color = '#555'; }}
            >
              <Search size={15} />
            </button>

            <button style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px',
              borderRadius: 11, border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)', color: '#bbb',
              fontFamily: 'Inter', fontWeight: 500, fontSize: 13, cursor: 'pointer',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.18)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.09)'; (e.currentTarget as HTMLButtonElement).style.color = '#eee'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLButtonElement).style.color = '#bbb'; }}
            >
              <Wallet size={13} /> Connect Wallet
            </button>

            <Link href="/dashboard">
              <div style={{
                width: 34, height: 34, borderRadius: 10,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                color: '#666', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLDivElement).style.color = '#aaa'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLDivElement).style.color = '#666'; }}
              >
                <User size={15} />
              </div>
            </Link>
          </div>

          {/* Mobile burger */}
          <button className="lg:hidden" onClick={() => setMenuOpen(!menuOpen)} style={{
            background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: 6,
          }}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              style={{ background: 'rgba(5,5,5,0.98)', borderTop: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {!hideLinks && links.map(l => (
                  <Link key={l.label} href={l.href} onClick={() => setMenuOpen(false)}
                    style={{ fontFamily: 'Inter', fontSize: 15, color: '#888', padding: '12px 16px', borderRadius: 12, textDecoration: 'none' }}>
                    {l.label}
                  </Link>
                ))}
                <button style={{
                  marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '13px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.05)', color: '#ccc', fontFamily: 'Inter', fontSize: 14, cursor: 'pointer',
                }}>
                  <Wallet size={14} /> Connect Wallet
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSearchOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 120, paddingLeft: 16, paddingRight: 16 }}>
            <motion.div initial={{ scale: 0.95, y: -12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              style={{ width: '100%', maxWidth: 540, borderRadius: 18, overflow: 'hidden', background: '#101010', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 40px 80px rgba(0,0,0,0.7)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <Search size={16} color="#444" />
                <input autoFocus type="text" placeholder="Search APIs, providers, categories…" style={{ flex: 1, border: 'none', fontSize: 14, background: 'transparent', color: '#e0e0e0', fontFamily: 'Inter' }} />
                <kbd style={{ padding: '3px 7px', borderRadius: 6, background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#555', fontSize: 11, fontFamily: 'Inter', cursor: 'pointer' }}
                  onClick={() => setSearchOpen(false)}>ESC</kbd>
              </div>
              {['GPT-4 Vision API', 'Claude Sonnet API', 'Whisper Speech-to-Text', 'Stable Diffusion XL', 'EmbedForce v3'].map(name => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 20px', borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#777', fontFamily: 'Inter', fontSize: 14, cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLDivElement).style.color = '#ccc'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; (e.currentTarget as HTMLDivElement).style.color = '#777'; }}>
                  <Search size={13} color="#333" /> {name}
                </div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
