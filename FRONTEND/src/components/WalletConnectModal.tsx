'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, ShieldCheck, ExternalLink, RefreshCw, CheckCircle2, ChevronRight, Layers, Sparkles } from 'lucide-react';
import { useWallet, WalletId } from '@txnlab/use-wallet-react';
import { useConnect, useAccount, useDisconnect } from 'wagmi';
import { useAuth } from '@/context/AuthContext';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDemo?: () => void;
}

export default function WalletConnectModal({ isOpen, onClose, onSelectDemo }: WalletConnectModalProps) {
  const [activeTab, setActiveTab] = useState<'evm' | 'algorand'>('evm');
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { loginWithWallet } = useAuth();

  // Algorand hook
  const { wallets: algoWallets, activeAddress: algoAddress } = useWallet();

  // EVM (Wagmi) hook
  const { connectors, connectAsync } = useConnect();
  const { address: evmAddress, connector: activeEvmConnector, isConnected: isEvmConnected } = useAccount();
  const { disconnect: disconnectEvm } = useDisconnect();

  if (!isOpen) return null;

  // Handle EVM Connection (Zerion, MetaMask, Coinbase, Injected)
  const handleEvmConnect = async (connector: any, walletName: string) => {
    setErrorMsg(null);
    setConnectingId(connector.id);
    try {
      const res = await connectAsync({ connector });
      const addr = res?.accounts?.[0];
      if (addr) {
        await loginWithWallet(addr, 'evm');
      }
      setConnectingId(null);
      onClose();
    } catch (err: any) {
      const msg = err?.message || String(err || '');
      if (err?.name === 'ProviderNotFoundError' || msg.includes('Provider not found') || msg.includes('not found')) {
        setErrorMsg(`${walletName} extension not detected in browser. Please install ${walletName} or use another wallet.`);
      } else if (msg.includes('User rejected') || msg.includes('User denied') || err?.code === 4001) {
        setErrorMsg('Connection request was cancelled.');
      } else {
        setErrorMsg(msg || `Failed to connect ${walletName}`);
      }
      setConnectingId(null);
    }
  };

  // Handle Algorand Connection (Pera, Defly, Lute, Kibisis, Exodus, etc.)
  const handleAlgoConnect = async (walletId: any, walletName: string) => {
    setErrorMsg(null);
    setConnectingId(walletId);
    try {
      const targetWallet = algoWallets?.find((w: any) => w.id === walletId);
      if (targetWallet) {
        let accounts = targetWallet.accounts;
        if (!targetWallet.isConnected) {
          accounts = await targetWallet.connect();
        }
        const addr = accounts?.[0]?.address || targetWallet.activeAddress;
        if (addr) {
          await loginWithWallet(addr, 'algorand');
        }
        setConnectingId(null);
        onClose();
      } else {
        throw new Error(`${walletName} provider not found`);
      }
    } catch (err: any) {
      const msg = err?.message || String(err || '');
      if (msg.includes('closed by user') || msg.includes('User Rejected') || msg.includes('user rejected')) {
        setErrorMsg('Connection request was cancelled by user.');
      } else if (msg.includes('not installed') || msg.includes('not detected') || msg.includes('not found')) {
        setErrorMsg(`${walletName} extension/app not detected. Install ${walletName} or select another wallet.`);
      } else {
        setErrorMsg(msg || `Failed to connect ${walletName}`);
      }
      setConnectingId(null);
    }
  };

  // Helper lists for rendering
  const evmWalletList = [
    {
      id: 'zerion',
      name: 'Zerion Wallet',
      description: 'Smart Web3 & Multi-chain EVM wallet',
      badge: 'Recommended',
      badgeColor: '#2b6cb0',
      icon: (
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 16 }}>
          Z
        </div>
      ),
      connector: connectors.find((c) => c.id === 'zerion' || c.name.toLowerCase().includes('zerion')) || connectors.find((c) => c.id === 'injected'),
    },
    {
      id: 'metamask',
      name: 'MetaMask',
      description: 'Popular Ethereum & EVM extension',
      badge: 'Popular',
      badgeColor: '#d97706',
      icon: (
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
          🦊
        </div>
      ),
      connector: connectors.find((c) => c.id === 'metaMask' || c.name.toLowerCase().includes('metamask')) || connectors[0],
    },
    {
      id: 'coinbaseWallet',
      name: 'Coinbase Wallet',
      description: 'Connect with Coinbase mobile or extension',
      icon: (
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(37, 99, 235, 0.15)', border: '1px solid rgba(37, 99, 235, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', fontWeight: 700, fontSize: 16 }}>
          C
        </div>
      ),
      connector: connectors.find((c) => c.id === 'coinbaseWalletSDK' || c.name.toLowerCase().includes('coinbase')),
    },
    {
      id: 'walletConnect',
      name: 'WalletConnect (EVM)',
      description: 'Scan QR code with any supported mobile wallet',
      icon: (
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa', fontSize: 18 }}>
          🌐
        </div>
      ),
      connector: connectors.find((c) => c.id === 'walletConnect' || c.name.toLowerCase().includes('walletconnect')),
    },
  ];

  const algoWalletList = [
    {
      id: WalletId.PERA,
      name: 'Pera Wallet',
      description: 'Official Mobile & Web Algorand Wallet',
      badge: 'Popular',
      badgeColor: '#ca8a04',
      icon: (
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(234, 179, 8, 0.15)', border: '1px solid rgba(234, 179, 8, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#facc15', fontWeight: 800, fontSize: 16 }}>
          P
        </div>
      ),
    },
    {
      id: WalletId.DEFLY,
      name: 'Defly Wallet',
      description: 'DeFi-focused Algorand mobile wallet',
      icon: (
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22d3ee', fontWeight: 800, fontSize: 16 }}>
          D
        </div>
      ),
    },
    {
      id: WalletId.LUTE,
      name: 'Lute Wallet',
      description: 'Browser extension for Algorand web apps',
      icon: (
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(249, 115, 22, 0.15)', border: '1px solid rgba(249, 115, 22, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fb923c', fontWeight: 800, fontSize: 16 }}>
          🔑
        </div>
      ),
    },
    {
      id: WalletId.KIBISIS,
      name: 'Kibisis Wallet',
      description: 'A-Vault & Canvas Algorand wallet extension',
      icon: (
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc', fontWeight: 800, fontSize: 16 }}>
          K
        </div>
      ),
    },
    {
      id: WalletId.WALLETCONNECT,
      name: 'WalletConnect (Algorand)',
      description: 'Connect mobile wallets via QR scan',
      icon: (
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa', fontSize: 18 }}>
          ⚡
        </div>
      ),
    },
  ];

  return (
    <AnimatePresence>
      <div style={{ position: 'fixed', inset: 0, zIndex: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(16px)',
          }}
        />

        {/* Modal Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: 480,
            borderRadius: 24,
            background: '#0d0d11',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 32px 64px rgba(0, 0, 0, 0.9), 0 0 40px rgba(0, 229, 255, 0.08)',
            overflow: 'hidden',
            color: '#f0f0f0',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {/* Header */}
          <div style={{ padding: '20px 24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.2), rgba(168, 85, 247, 0.2))', border: '1px solid rgba(0, 229, 255, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00e5ff' }}>
                <Wallet size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#ffffff', letterSpacing: '-0.01em' }}>Connect Wallet</h3>
                <p style={{ fontSize: 12, color: '#888899', margin: 0, marginTop: 2 }}>Select your preferred multi-chain or Algorand wallet</p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 10, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaaaaa', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
            >
              <X size={16} />
            </button>
          </div>

          {/* Network Category Tabs */}
          <div style={{ padding: '12px 24px 0', display: 'flex', gap: 8 }}>
            <button
              onClick={() => setActiveTab('evm')}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: 12,
                border: activeTab === 'evm' ? '1px solid rgba(0, 229, 255, 0.4)' : '1px solid rgba(255,255,255,0.06)',
                background: activeTab === 'evm' ? 'rgba(0, 229, 255, 0.1)' : 'rgba(255,255,255,0.03)',
                color: activeTab === 'evm' ? '#00e5ff' : '#888899',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transition: 'all 0.2s',
              }}
            >
              <Layers size={14} /> EVM Multi-Chain (Zerion)
            </button>
            <button
              onClick={() => setActiveTab('algorand')}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: 12,
                border: activeTab === 'algorand' ? '1px solid rgba(249, 115, 22, 0.4)' : '1px solid rgba(255,255,255,0.06)',
                background: activeTab === 'algorand' ? 'rgba(249, 115, 22, 0.1)' : 'rgba(255,255,255,0.03)',
                color: activeTab === 'algorand' ? '#fb923c' : '#888899',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transition: 'all 0.2s',
              }}
            >
              <Sparkles size={14} /> Algorand Ecosystem
            </button>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div style={{ margin: '12px 24px 0', padding: '10px 14px', borderRadius: 10, background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', fontSize: 12 }}>
              {errorMsg}
            </div>
          )}

          {/* Wallet Options List */}
          <div style={{ padding: 24, maxHeight: 360, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {activeTab === 'evm' ? (
              evmWalletList.map((w) => {
                const isConnecting = connectingId === w.id;
                const isCurrentConnected = isEvmConnected && (activeEvmConnector?.id === w.connector?.id || (w.id === 'zerion' && activeEvmConnector?.name.toLowerCase().includes('zerion')));

                return (
                  <button
                    key={w.id}
                    onClick={() => w.connector && handleEvmConnect(w.connector, w.name)}
                    disabled={!w.connector || isConnecting}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: 14,
                      border: isCurrentConnected ? '1px solid rgba(0, 229, 255, 0.5)' : '1px solid rgba(255, 255, 255, 0.07)',
                      background: isCurrentConnected ? 'rgba(0, 229, 255, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                      cursor: w.connector ? 'pointer' : 'not-allowed',
                      opacity: w.connector ? 1 : 0.6,
                      textAlign: 'left',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (w.connector && !isCurrentConnected) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.07)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isCurrentConnected) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.07)';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      {w.icon}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: '#ffffff' }}>{w.name}</span>
                          {w.badge && (
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 6, background: 'rgba(37, 99, 235, 0.2)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.4)' }}>
                              {w.badge}
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: 11, color: '#888899', marginTop: 2, display: 'block' }}>{w.description}</span>
                      </div>
                    </div>

                    <div>
                      {isConnecting ? (
                        <RefreshCw size={16} className="animate-spin" color="#00e5ff" />
                      ) : isCurrentConnected ? (
                        <CheckCircle2 size={18} color="#00e5ff" />
                      ) : (
                        <ChevronRight size={16} color="#666677" />
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              algoWalletList.map((w) => {
                const targetAlgoWallet = algoWallets?.find((aw: any) => aw.id === w.id);
                const isConnecting = connectingId === w.id;
                const isConnected = targetAlgoWallet?.isConnected;

                return (
                  <button
                    key={w.id}
                    onClick={() => handleAlgoConnect(w.id as any, w.name)}
                    disabled={isConnecting}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: 14,
                      border: isConnected ? '1px solid rgba(249, 115, 22, 0.5)' : '1px solid rgba(255, 255, 255, 0.07)',
                      background: isConnected ? 'rgba(249, 115, 22, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isConnected) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.07)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isConnected) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.07)';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      {w.icon}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: '#ffffff' }}>{w.name}</span>
                          {w.badge && (
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 6, background: 'rgba(234, 179, 8, 0.2)', color: '#facc15', border: '1px solid rgba(234, 179, 8, 0.4)' }}>
                              {w.badge}
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: 11, color: '#888899', marginTop: 2, display: 'block' }}>{w.description}</span>
                      </div>
                    </div>

                    <div>
                      {isConnecting ? (
                        <RefreshCw size={16} className="animate-spin" color="#fb923c" />
                      ) : isConnected ? (
                        <CheckCircle2 size={18} color="#fb923c" />
                      ) : (
                        <ChevronRight size={16} color="#666677" />
                      )}
                    </div>
                  </button>
                );
              })
            )}

            {/* TestNet Demo Fallback Button */}
            {onSelectDemo && (
              <button
                onClick={() => {
                  onSelectDemo();
                  onClose();
                }}
                style={{
                  marginTop: 6,
                  padding: '10px 14px',
                  borderRadius: 12,
                  border: '1px dashed rgba(255, 255, 255, 0.15)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  color: '#aaaaaa',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.color = '#aaaaaa';
                }}
              >
                ⚡ Use Algorand TestNet Demo Address (No extension required)
              </button>
            )}
          </div>

          {/* Footer Security Notice */}
          <div style={{ padding: '14px 24px', background: 'rgba(0, 0, 0, 0.4)', borderTop: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: '#666677' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldCheck size={14} color="#00e5ff" /> Non-custodial & Encrypted Connection
            </div>
            <a href="https://zerion.io" target="_blank" rel="noopener noreferrer" style={{ color: '#00e5ff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
              Zerion Web3 <ExternalLink size={10} />
            </a>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
