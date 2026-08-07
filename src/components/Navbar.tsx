'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Wallet, User, Menu, X, Zap, Copy, Check, LogOut, AlertTriangle, RefreshCw, Coins } from 'lucide-react';
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain, useBalance, useReadContract } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';

const erc20Abi = [
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
] as const;

const USDC_BASE_SEPOLIA = '0x036cbd53842c5426634e7929541ec2318f3dcf7e';

const links = [
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'Dashboard',   href: '/dashboard' },
  { label: 'Trace Viewer', href: '/trace' },
];

export default function Navbar({ hideLinks = false }: { hideLinks?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Fallback demo wallet state when no browser extension is detected
  const [demoWalletAddress, setDemoWalletAddress] = useState<string | null>(null);

  // Wagmi hooks
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const activeAddress = address || demoWalletAddress;
  const activeIsConnected = isConnected || !!demoWalletAddress;
  const isWrongNetwork = isConnected && chainId !== baseSepolia.id;

  // Wagmi's store can restore a persisted connection synchronously during
  // hydration, causing a server/client mismatch. Render the server snapshot
  // until mounted, then reveal the real wallet state.
  const hydratedConnected = mounted ? activeIsConnected : false;

  // Fetch real ETH balance on Base Sepolia
  const { data: ethBalanceData } = useBalance({
    address: activeAddress as `0x${string}` | undefined,
    chainId: baseSepolia.id,
    query: {
      enabled: !!activeAddress,
    },
  });

  // Fetch real USDC balance (6 decimals) on Base Sepolia
  const { data: usdcRawBalance } = useReadContract({
    address: USDC_BASE_SEPOLIA,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: activeAddress ? [activeAddress as `0x${string}`] : undefined,
    chainId: baseSepolia.id,
    query: {
      enabled: !!activeAddress,
    },
  });

  // Formatted balances
  const formattedEth = ethBalanceData
    ? `${(Number(ethBalanceData.value) / 10 ** ethBalanceData.decimals).toFixed(4)} ETH`
    : isConnected
    ? '0.0000 ETH'
    : '0.0450 ETH';

  const formattedUsdc = usdcRawBalance !== undefined
    ? `${(Number(usdcRawBalance) / 1e6).toFixed(2)} USDC`
    : isConnected
    ? '0.00 USDC'
    : '125.50 USDC';

  useEffect(() => {
    setMounted(true);
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const handleConnect = async () => {
    // 1. Try Wagmi injected connector
    if (connectors && connectors.length > 0) {
      try {
        const injectedConn = connectors.find(
          (c) => c.id === 'injected' || c.name.toLowerCase().includes('metamask')
        ) || connectors[0];

        if (injectedConn) {
          connect({ connector: injectedConn });
          return;
        }
      } catch (e) {
        console.warn('Wagmi connection attempt error:', e);
      }
    }

    // 2. Direct window.ethereum fallback if extension present
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({
          method: 'eth_requestAccounts',
        });
        if (accounts && accounts[0]) {
          setDemoWalletAddress(accounts[0]);
          return;
        }
      } catch (e) {
        console.warn('Direct ethereum request error:', e);
      }
    }

    // 3. Demo wallet fallback if no Web3 wallet extension is installed
    setDemoWalletAddress('0x71C83B47c04E923a10F8721102910a9E23');
  };

  const handleDisconnect = () => {
    if (isConnected) disconnect();
    setDemoWalletAddress(null);
    setDropdownOpen(false);
  };

  const handleCopyAddress = () => {
    if (activeAddress) {
      navigator.clipboard.writeText(activeAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const truncatedAddress = activeAddress
    ? `${activeAddress.slice(0, 6)}...${activeAddress.slice(-4)}`
    : '';

  return (
    <>
      {/* Network Warning Banner */}
      {isWrongNetwork && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 110,
            background: 'rgba(180, 60, 60, 0.95)',
            backdropFilter: 'blur(12px)',
            color: '#ffffff',
            padding: '8px 24px',
            fontSize: 12,
            fontFamily: 'Inter',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            boxShadow: '0 4px 20px rgba(180,60,60,0.3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertTriangle size={14} />
            <span>Wrong Network: Please switch to Base Sepolia (Chain ID 84532) to transact.</span>
          </div>
          <button
            onClick={() => switchChain?.({ chainId: baseSepolia.id })}
            style={{
              background: '#ffffff',
              color: '#050505',
              border: 'none',
              borderRadius: 6,
              padding: '3px 10px',
              fontSize: 11,
              fontFamily: 'Inter',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <RefreshCw size={11} /> Switch Network
          </button>
        </div>
      )}

      <motion.nav
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'fixed',
          top: isWrongNetwork ? 34 : 0,
          left: 0,
          right: 0,
          zIndex: 100,
          transition: 'background 0.4s, backdrop-filter 0.4s, border-color 0.4s, top 0.3s',
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

            {/* Wallet Button & Dropdown */}
            <div style={{ position: 'relative' }}>
              {!hydratedConnected ? (
                <button
                  onClick={handleConnect}
                  style={{
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
              ) : (
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
                    borderRadius: 11,
                    border: `1px solid ${isWrongNetwork ? 'rgba(180,60,60,0.4)' : 'rgba(255,255,255,0.12)'}`,
                    background: isWrongNetwork ? 'rgba(180,60,60,0.1)' : 'rgba(255,255,255,0.06)',
                    color: isWrongNetwork ? '#c83c3c' : '#f0f0f0',
                    fontFamily: 'monospace', fontWeight: 500, fontSize: 13, cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: isWrongNetwork ? '#c83c3c' : '#5a9a5a',
                      boxShadow: `0 0 6px ${isWrongNetwork ? '#c83c3c' : '#5a9a5a'}`,
                    }}
                  />
                  <span>{truncatedAddress}</span>
                </button>
              )}

              {/* Wallet Dropdown Menu */}
              <AnimatePresence>
                {hydratedConnected && dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 10px)',
                      right: 0,
                      width: 270,
                      borderRadius: 16,
                      overflow: 'hidden',
                      background: '#101012',
                      border: '1px solid rgba(255,255,255,0.1)',
                      boxShadow: '0 24px 48px rgba(0,0,0,0.7)',
                      padding: 16,
                      zIndex: 120,
                    }}
                  >
                    {/* Full Address & Copy */}
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 11, color: '#555555', fontFamily: 'Inter', marginBottom: 4 }}>
                        Connected Account
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 10px',
                          borderRadius: 8,
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.06)',
                          fontSize: 11,
                          fontFamily: 'monospace',
                          color: '#cccccc',
                          wordBreak: 'break-all',
                        }}
                      >
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{activeAddress}</span>
                        <button
                          onClick={handleCopyAddress}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#777777',
                            cursor: 'pointer',
                            padding: 2,
                            marginLeft: 6,
                            display: 'flex',
                            alignItems: 'center',
                          }}
                          title="Copy Address"
                        >
                          {copied ? <Check size={12} color="#5a9a5a" /> : <Copy size={12} />}
                        </button>
                      </div>
                    </div>

                    {/* Network Status */}
                    <div style={{ marginBottom: 12, padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ fontSize: 11, color: '#555555', fontFamily: 'Inter', marginBottom: 4 }}>
                        Network Status
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontFamily: 'Inter', color: isWrongNetwork ? '#c83c3c' : '#5a9a5a' }}>
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              background: isWrongNetwork ? '#c83c3c' : '#5a9a5a',
                            }}
                          />
                          {isWrongNetwork ? 'Wrong Network' : 'Base Sepolia'}
                        </div>
                        {isWrongNetwork && (
                          <button
                            onClick={() => switchChain?.({ chainId: baseSepolia.id })}
                            style={{
                              padding: '4px 8px',
                              borderRadius: 6,
                              background: 'rgba(180,60,60,0.2)',
                              border: '1px solid rgba(180,60,60,0.3)',
                              color: '#ffffff',
                              fontSize: 10,
                              fontFamily: 'Inter',
                              cursor: 'pointer',
                            }}
                          >
                            Switch
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Wallet Balances Section (ETH & USDC) */}
                    <div style={{ marginBottom: 14, padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#555555', fontFamily: 'Inter', marginBottom: 8 }}>
                        <Coins size={12} /> Base Sepolia Balances
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: '#888888', fontFamily: 'Inter' }}>ETH Balance</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#e0e0e0', fontFamily: 'monospace' }}>{formattedEth}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 12, color: '#888888', fontFamily: 'Inter' }}>USDC Balance</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#5a9a5a', fontFamily: 'monospace' }}>{formattedUsdc}</span>
                      </div>
                    </div>

                    {/* Disconnect */}
                    <button
                      onClick={handleDisconnect}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        padding: '9px',
                        borderRadius: 10,
                        border: '1px solid rgba(255,255,255,0.08)',
                        background: 'rgba(255,255,255,0.04)',
                        color: '#c83c3c',
                        fontSize: 12,
                        fontFamily: 'Inter',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(180,60,60,0.15)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                    >
                      <LogOut size={13} /> Disconnect Wallet
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

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

                {!hydratedConnected ? (
                  <button
                    onClick={() => {
                      handleConnect();
                      setMenuOpen(false);
                    }}
                    style={{
                      marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      padding: '13px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.05)', color: '#ccc', fontFamily: 'Inter', fontSize: 14, cursor: 'pointer',
                    }}
                  >
                    <Wallet size={14} /> Connect Wallet
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleDisconnect();
                      setMenuOpen(false);
                    }}
                    style={{
                      marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      padding: '13px', borderRadius: 12, border: '1px solid rgba(180,60,60,0.3)',
                      background: 'rgba(180,60,60,0.1)', color: '#c83c3c', fontFamily: 'Inter', fontSize: 14, cursor: 'pointer',
                    }}
                  >
                    <LogOut size={14} /> Disconnect ({truncatedAddress})
                  </button>
                )}
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
