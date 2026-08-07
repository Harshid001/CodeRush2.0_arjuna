import Link from 'next/link';
import { Zap, GitBranch, X, ExternalLink } from 'lucide-react';

const cols = {
  Product:    ['Marketplace', 'Providers', 'Pricing', 'Changelog', 'Status'],
  Company:    ['About', 'Blog', 'Careers', 'Press', 'Contact'],
  Legal:      ['Privacy', 'Terms', 'Cookies', 'Security'],
  Developers: ['API Docs', 'SDKs', 'Webhooks', 'GitHub'],
};

const SocialBtn = ({ children }: { children: React.ReactNode }) => (
  <button style={{
    width: 32, height: 32, borderRadius: 9, border: '1px solid rgba(255,255,255,0.07)',
    background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#444', cursor: 'pointer', transition: 'all 0.2s',
  }}
    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#888'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.14)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)'; }}
    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#444'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)'; }}
  >
    {children}
  </button>
);

export default function Footer() {
  return (
    <footer style={{ background: '#050505', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: 'auto' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '72px 28px 40px' }}>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 40, marginBottom: 64 }}
          className="grid-cols-1 md:grid-cols-5">

          {/* Brand col */}
          <div>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, textDecoration: 'none', marginBottom: 16 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: 'linear-gradient(135deg, #e8e8e8 0%, #888 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Zap size={13} color="#050505" strokeWidth={2.8} />
              </div>
              <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 15, color: '#e8e8e8', letterSpacing: '-0.02em' }}>NexusAPI</span>
            </Link>
            <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#444', lineHeight: 1.75, maxWidth: 220, marginBottom: 20 }}>
              The premium marketplace for AI & Data APIs. Built for developers, enterprises, and autonomous agents.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <SocialBtn><GitBranch size={13} /></SocialBtn>
              <SocialBtn><X size={13} /></SocialBtn>
              <SocialBtn><ExternalLink size={13} /></SocialBtn>
            </div>
          </div>

          {/* Link cols */}
          {Object.entries(cols).map(([cat, items]) => (
            <div key={cat}>
              <p style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 600, color: '#333', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 18 }}>{cat}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {items.map(item => (
                  <Link key={item} href="#" style={{ fontFamily: 'Inter', fontSize: 13, color: '#444', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#888'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#444'; }}>
                    {item}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 28, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#2a2a2a' }}>© 2026 NexusAPI Technologies, Inc.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2d5a2d', display: 'block', boxShadow: '0 0 8px rgba(60,140,60,0.7)' }} />
            <span style={{ fontFamily: 'Inter', fontSize: 12, color: '#2a2a2a' }}>All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
