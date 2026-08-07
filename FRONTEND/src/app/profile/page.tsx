'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  User,
  ShieldCheck,
  Wallet,
  Mail,
  Save,
  LogOut,
  ArrowLeft,
  Key,
  CheckCircle2,
  Sparkles,
  Zap,
  Activity,
  Award,
} from 'lucide-react';
import type { MouseEvent, FocusEvent } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ParticleBackground from '@/components/ParticleBackground';
import { useAuth } from '@/context/AuthContext';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoggedIn, logout, updateProfile } = useAuth();

  const [name, setName] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setWalletAddress(user.walletAddress || '');
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty.');
      return;
    }

    setSaving(true);
    try {
      const success = await updateProfile({
        name: name.trim(),
        walletAddress: walletAddress.trim(),
      });

      if (success) {
        toast.success('Account profile updated successfully!');
      } else {
        toast.error('Failed to update profile.');
      }
    } catch (err) {
      toast.error('Error saving profile changes.');
    } finally {
      setSaving(false);
    }
  };

  const displayName = user?.name || name || 'Developer User';
  const displayEmail = user?.email || 'developer@example.com';
  const displayRole = user?.role ? user.role.toUpperCase() : 'DEVELOPER';

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        backgroundColor: '#050508',
        color: '#ffffff',
        fontFamily: "'Inter', system-ui, sans-serif",
        overflowX: 'hidden',
      }}
    >
      <ParticleBackground />
      <Navbar />

      <main
        style={{
          position: 'relative',
          zIndex: 10,
          paddingTop: 104,
          paddingBottom: 80,
        }}
      >
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px' }}>
          {/* Header Bar */}
          <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link
              href="/dashboard"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                color: '#888899',
                fontSize: 13,
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e: MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = '#00e5ff')}
              onMouseLeave={(e: MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = '#888899')}
            >
              <ArrowLeft size={16} />
              <span>Back to Dashboard</span>
            </Link>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 14px',
                borderRadius: 999,
                backgroundColor: 'rgba(0, 229, 255, 0.08)',
                border: '1px solid rgba(0, 229, 255, 0.25)',
                color: '#00e5ff',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <Sparkles size={13} color="#00e5ff" />
              <span>x402 Account & Identity</span>
            </div>
          </div>

          {/* User Profile Banner Card */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              borderRadius: 24,
              backgroundColor: 'rgba(15, 15, 20, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              padding: '32px 36px',
              boxShadow: '0 30px 80px rgba(0, 0, 0, 0.8), 0 0 40px rgba(0, 210, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              marginBottom: 32,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 280,
                height: 280,
                background: 'radial-gradient(circle, rgba(0, 229, 255, 0.08) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
              {/* Avatar / Badge */}
              <div style={{ position: 'relative' }}>
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={displayName}
                    style={{
                      width: 84,
                      height: 84,
                      borderRadius: 24,
                      objectFit: 'cover',
                      border: '2px solid rgba(0, 229, 255, 0.5)',
                      boxShadow: '0 0 25px rgba(0, 229, 255, 0.25)',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 84,
                      height: 84,
                      borderRadius: 24,
                      background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.25), rgba(168, 85, 247, 0.25))',
                      border: '2px solid rgba(0, 229, 255, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 32,
                      fontWeight: 800,
                      color: '#00e5ff',
                      boxShadow: '0 0 25px rgba(0, 229, 255, 0.2)',
                    }}
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div
                  style={{
                    position: 'absolute',
                    bottom: -4,
                    right: -4,
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    border: '3px solid #0f0f14',
                  }}
                  title="Session Active"
                />
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 240 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6, flexWrap: 'wrap' }}>
                  <h1
                    style={{
                      fontSize: 26,
                      fontWeight: 700,
                      color: '#ffffff',
                      margin: 0,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {displayName}
                  </h1>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: 8,
                      backgroundColor: 'rgba(0, 229, 255, 0.1)',
                      border: '1px solid rgba(0, 229, 255, 0.3)',
                      color: '#00e5ff',
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                    }}
                  >
                    {displayRole}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 18, color: '#888899', fontSize: 13, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Mail size={14} color="#00e5ff" />
                    <span>{displayEmail}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ShieldCheck size={14} color="#10b981" />
                    <span style={{ color: '#10b981' }}>OAuth OIDC Verified</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div>
                <button
                  onClick={() => {
                    logout();
                    toast.success('Logged out successfully');
                    router.push('/login');
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 18px',
                    borderRadius: 14,
                    backgroundColor: 'rgba(220, 50, 50, 0.1)',
                    border: '1px solid rgba(220, 50, 50, 0.3)',
                    color: '#ff6b6b',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.backgroundColor = 'rgba(220, 50, 50, 0.2)')}
                  onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.backgroundColor = 'rgba(220, 50, 50, 0.1)')}
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Grid Layout: Profile Form & Quick Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 28 }} className="grid-cols-1 lg:grid-cols-3">
            {/* Main Profile Edit Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              style={{ gridColumn: 'span 2' }}
            >
              <div
                style={{
                  borderRadius: 20,
                  backgroundColor: 'rgba(15, 15, 20, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: 32,
                  boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                  <User size={20} color="#00e5ff" />
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: '#ffffff', margin: 0 }}>
                    Account Profile Settings
                  </h2>
                </div>

                <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {/* Full Name */}
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#cccccc', marginBottom: 8 }}>
                      Account Name / Display Name
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        style={{
                          width: '100%',
                          padding: '12px 16px 12px 42px',
                          borderRadius: 12,
                          backgroundColor: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#ffffff',
                          fontSize: 14,
                          fontFamily: 'Inter',
                          outline: 'none',
                          transition: 'border 0.2s',
                        }}
                        onFocus={(e: FocusEvent<HTMLInputElement>) => (e.currentTarget.style.borderColor = '#00e5ff')}
                        onBlur={(e: FocusEvent<HTMLInputElement>) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
                      />
                      <User size={16} color="#888899" style={{ position: 'absolute', left: 14, top: 15 }} />
                    </div>
                    <span style={{ fontSize: 11, color: '#666677', marginTop: 4, display: 'block' }}>
                      This name will be displayed across your developer dashboard, receipts, and identity tokens.
                    </span>
                  </div>

                  {/* Email (Read Only) */}
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#cccccc', marginBottom: 8 }}>
                      Email Address (OAuth Provider)
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="email"
                        value={displayEmail}
                        disabled
                        style={{
                          width: '100%',
                          padding: '12px 16px 12px 42px',
                          borderRadius: 12,
                          backgroundColor: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                          color: '#888899',
                          fontSize: 14,
                          fontFamily: 'Inter',
                          cursor: 'not-allowed',
                        }}
                      />
                      <Mail size={16} color="#666677" style={{ position: 'absolute', left: 14, top: 15 }} />
                    </div>
                  </div>

                  {/* Wallet Address */}
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#cccccc', marginBottom: 8 }}>
                      Algorand / Web3 Wallet Address
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                        placeholder="e.g. GQHCRMG3DSGF6OWFQ6W6MT5CDV5IZTNEVHFYKNB42EI4VDOINC6AZSYB74"
                        style={{
                          width: '100%',
                          padding: '12px 16px 12px 42px',
                          borderRadius: 12,
                          backgroundColor: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#00e5ff',
                          fontSize: 13,
                          fontFamily: 'monospace',
                          outline: 'none',
                          transition: 'border 0.2s',
                        }}
                        onFocus={(e: FocusEvent<HTMLInputElement>) => (e.currentTarget.style.borderColor = '#00e5ff')}
                        onBlur={(e: FocusEvent<HTMLInputElement>) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
                      />
                      <Wallet size={16} color="#888899" style={{ position: 'absolute', left: 14, top: 15 }} />
                    </div>
                    <span style={{ fontSize: 11, color: '#666677', marginTop: 4, display: 'block' }}>
                      Used for automated settlement receipts and x402 payment authorization.
                    </span>
                  </div>

                  {/* Save Button */}
                  <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="submit"
                      disabled={saving}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '12px 24px',
                        borderRadius: 14,
                        background: 'linear-gradient(135deg, #00e5ff 0%, #00a8ff 100%)',
                        color: '#000000',
                        fontSize: 14,
                        fontWeight: 700,
                        border: 'none',
                        cursor: saving ? 'not-allowed' : 'pointer',
                        boxShadow: '0 8px 24px rgba(0, 229, 255, 0.3)',
                        transition: 'transform 0.15s ease',
                      }}
                      onMouseDown={(e: MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.transform = 'scale(0.97)')}
                      onMouseUp={(e: MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                      <Save size={16} />
                      <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>

            {/* Sidebar Security & Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
            >
              {/* Token & Security Badge */}
              <div
                style={{
                  borderRadius: 20,
                  backgroundColor: 'rgba(15, 15, 20, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: 24,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <Key size={18} color="#00e5ff" />
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#ffffff', margin: 0 }}>
                    Security & Session
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ padding: 12, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: 11, color: '#888899', marginBottom: 4 }}>JWT Status</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981', fontSize: 13, fontWeight: 600 }}>
                      <CheckCircle2 size={14} /> Active (7 Days Valid)
                    </div>
                  </div>

                  <div style={{ padding: 12, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: 11, color: '#888899', marginBottom: 4 }}>Auth Method</div>
                    <div style={{ color: '#ffffff', fontSize: 13, fontWeight: 600 }}>
                      {user?.googleId ? 'Google Identity Services' : 'Unified JWT Authentication'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Developer Stats Card */}
              <div
                style={{
                  borderRadius: 20,
                  backgroundColor: 'rgba(15, 15, 20, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: 24,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <Award size={18} color="#00e5ff" />
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#ffffff', margin: 0 }}>
                    Developer Tier
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: '#888899' }}>Daily Request Cap</span>
                    <span style={{ color: '#00e5ff', fontWeight: 600 }}>Unlimited</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: '#888899' }}>Per-Request Cap</span>
                    <span style={{ color: '#ffffff', fontWeight: 600 }}>$5.00 USD</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: '#888899' }}>API Quality Filter</span>
                    <span style={{ color: '#10b981', fontWeight: 600 }}>&gt; 70% Score</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
