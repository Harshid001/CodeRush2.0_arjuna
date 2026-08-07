'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Activity, DollarSign, Zap, Database, ArrowUpRight, Clock, User, Settings, LogOut, ChevronRight, Download, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BudgetCaps from '@/components/BudgetCaps';
import ReceiptCard from '@/components/ReceiptCard';
import ProviderBreakToggle from '@/components/ProviderBreakToggle';
import { useReceipts } from '@/lib/receiptStore';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@txnlab/use-wallet-react';

const reqData    = [{ m:'Jan',v:12000},{m:'Feb',v:18000},{m:'Mar',v:15000},{m:'Apr',v:22000},{m:'May',v:28000},{m:'Jun',v:24000},{m:'Jul',v:35000},{m:'Aug',v:42000}];
const spendData  = [{ m:'Jan',v:48},{m:'Feb',v:72},{m:'Mar',v:61},{m:'Apr',v:88},{m:'May',v:115},{m:'Jun',v:98},{m:'Jul',v:142},{m:'Aug',v:167}];

const myAPIs = [
  { name:'GPT-4 Vision Pro', pct:78, used:'7.8K', cap:'10K',   status:'active' },
  { name:'EmbedForce v3',    pct:45, used:'225K', cap:'500K',  status:'active' },
  { name:'Whisper STT',      pct:23, used:'11.5K',cap:'50K',   status:'active' },
  { name:'Claude Inference', pct:91, used:'7.3K', cap:'8K',    status:'warning' },
];

const Tip = ({ active, payload, label }: { active?:boolean; payload?: Array<{value:number}>; label?:string }) =>
  active && payload?.length ? (
    <div style={{ background:'#0e0e10', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:'8px 14px', fontFamily:'Inter' }}>
      <div style={{ fontSize:11, color:'#555', marginBottom:3 }}>{label}</div>
      <div style={{ fontSize:14, fontWeight:600, color:'#ccc' }}>{payload[0].value.toLocaleString()}</div>
    </div>
  ) : null;

const navItems = [
  { label:'Overview',     icon:Activity,   href:'/dashboard' },
  { label:'Account Profile', icon:User,    href:'/profile'   },
  { label:'My APIs',      icon:Database,   href:'/marketplace' },
  { label:'Spending',     icon:DollarSign, href:'/payment'   },
  { label:'Transactions', icon:Clock,      href:'/trace'     },
  { label:'Receipts',     icon:FileText,   href:'/provenance'},
  { label:'Settings',     icon:Settings,   href:'/profile'   },
];

export default function Dashboard() {
  const router = useRouter();
  const { receipts, exportReceiptsCSV, exportReceiptsJSON } = useReceipts();
  const { user, logout, isLoggedIn } = useAuth();
  const { activeAddress: connectedAddress } = useWallet();

  const displayName = user?.name || (connectedAddress ? `Account (${connectedAddress.slice(0, 6)}...${connectedAddress.slice(-4)})` : 'Nexus Developer');
  const displayRole = user?.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'Developer';
  const displayWallet = connectedAddress
    ? `${connectedAddress.slice(0, 6)}...${connectedAddress.slice(-4)}`
    : user?.walletAddress
    ? (user.walletAddress.length > 14 ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}` : user.walletAddress)
    : 'Not Connected';

  return (
    <div style={{ background:'#050505', minHeight:'100vh' }}>
      <Navbar />
      <main style={{ paddingTop:88, paddingBottom:80 }}>
        <div style={{ width: '100%', padding: '0 32px' }}>
          <div style={{ display:'flex', gap:28, marginTop:20 }}>

            {/* Sidebar */}
            <motion.aside initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.5 }}
              style={{
                width: 220,
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                position: 'sticky',
                top: 104,
                alignSelf: 'flex-start',
                maxHeight: 'calc(100vh - 120px)',
                overflowY: 'auto',
              }}
              className="hidden lg:flex"
            >
              {/* Profile Card */}
              <Link href="/profile" style={{ textDecoration:'none' }}>
                <div style={{
                  padding:'16px', borderRadius:16, background:'rgba(255,255,255,0.03)',
                  border:'1px solid rgba(255,255,255,0.08)', marginBottom:12,
                  transition:'all 0.2s ease', cursor:'pointer'
                }}
                onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.borderColor='rgba(0,229,255,0.3)';(e.currentTarget as HTMLDivElement).style.background='rgba(0,229,255,0.04)';}}
                onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.borderColor='rgba(255,255,255,0.08)';(e.currentTarget as HTMLDivElement).style.background='rgba(255,255,255,0.03)';}}
                >
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt={displayName} style={{ width:36, height:36, borderRadius:10, objectFit:'cover' }} />
                    ) : (
                      <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg, rgba(0,229,255,0.2), rgba(168,85,247,0.2))', border:'1px solid rgba(0,229,255,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:14, color:'#00e5ff' }}>
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div style={{ flex:1, overflow:'hidden' }}>
                      <div style={{ fontFamily:'Inter', fontSize:13, fontWeight:600, color:'#ffffff', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{displayName}</div>
                      <div style={{ fontFamily:'Inter', fontSize:11, color:'#8888aa' }}>{displayRole}</div>
                    </div>
                  </div>
                  <div style={{ padding:'6px 10px', borderRadius:8, background:'rgba(0,0,0,0.4)', border:'1px solid rgba(255,255,255,0.06)', fontFamily:'monospace', fontSize:10, color:'#00e5ff', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <span style={{ overflow:'hidden', textOverflow:'ellipsis' }}>{displayWallet}</span>
                    <span style={{ fontSize:9, color:'#8888aa', textTransform:'uppercase' }}>Profile ↗</span>
                  </div>
                </div>
              </Link>

              {navItems.map(item => (
                <button key={item.label} onClick={() => router.push(item.href)} style={{
                  display:'flex', alignItems:'center', gap:10, padding:'10px 13px', borderRadius:12,
                  border:'1px solid transparent', background: item.label === 'Overview' ? 'rgba(255,255,255,0.06)' : 'transparent',
                  fontFamily:'Inter', fontSize:13, fontWeight:500, color: item.label === 'Overview' ? '#ffffff' : '#888899', cursor:'pointer',
                  textAlign:'left', transition:'all 0.2s', width:'100%',
                }}
                  onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.background='rgba(255,255,255,0.07)';(e.currentTarget as HTMLButtonElement).style.color='#fff';}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.background = item.label === 'Overview' ? 'rgba(255,255,255,0.06)' : 'transparent';(e.currentTarget as HTMLButtonElement).style.color = item.label === 'Overview' ? '#ffffff' : '#888899';}}>
                  <item.icon size={14} color={item.label === 'Overview' ? '#00e5ff' : '#888899'} />
                  {item.label}
                </button>
              ))}

              <div style={{ marginTop:'auto', paddingTop:16 }}>
                {isLoggedIn ? (
                  <button onClick={() => { logout(); router.push('/login'); }} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 13px', borderRadius:12, border:'1px solid rgba(220,50,50,0.2)', background:'rgba(220,50,50,0.06)', fontFamily:'Inter', fontSize:13, color:'#ff6b6b', cursor:'pointer', width:'100%', transition:'all 0.2s' }}>
                    <LogOut size={13} /> Sign out
                  </button>
                ) : (
                  <Link href="/login" style={{ textDecoration:'none' }}>
                    <button style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 13px', borderRadius:12, border:'1px solid rgba(0,229,255,0.3)', background:'rgba(0,229,255,0.08)', fontFamily:'Inter', fontSize:13, color:'#00e5ff', cursor:'pointer', width:'100%', transition:'all 0.2s' }}>
                      <User size={13} /> Sign In
                    </button>
                  </Link>
                )}
              </div>
            </motion.aside>

            {/* Main Content */}
            <div style={{ flex:1, minWidth:0 }}>
              <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:28, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
                <div>
                  <h1 style={{ fontFamily:'Playfair Display, Georgia, serif', fontWeight:600, fontSize:'2rem', color:'#efefef', letterSpacing:'-0.025em', marginBottom:4 }}>Dashboard</h1>
                  <p style={{ fontFamily:'Inter', fontSize:13, color:'#888899' }}>Welcome back, <strong style={{ color:'#ffffff' }}>{displayName}</strong> · Real-time receipt tracking active</p>
                </div>

                {/* Export Buttons */}
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <button
                    onClick={exportReceiptsCSV}
                    style={{
                      display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:10,
                      border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.05)',
                      color:'#cccccc', fontFamily:'Inter', fontSize:12, fontWeight:500, cursor:'pointer',
                      transition:'all 0.2s',
                    }}
                    onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.background='rgba(255,255,255,0.09)';(e.currentTarget as HTMLButtonElement).style.color='#fff';}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.background='rgba(255,255,255,0.05)';(e.currentTarget as HTMLButtonElement).style.color='#ccc';}}
                  >
                    <Download size={13} /> Export CSV
                  </button>
                  <button
                    onClick={exportReceiptsJSON}
                    style={{
                      display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:10,
                      border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.05)',
                      color:'#cccccc', fontFamily:'Inter', fontSize:12, fontWeight:500, cursor:'pointer',
                      transition:'all 0.2s',
                    }}
                    onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.background='rgba(255,255,255,0.09)';(e.currentTarget as HTMLButtonElement).style.color='#fff';}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.background='rgba(255,255,255,0.05)';(e.currentTarget as HTMLButtonElement).style.color='#ccc';}}
                  >
                    <Download size={13} /> Export JSON
                  </button>
                </div>
              </motion.div>

              {/* Debug Tool: Provider Break Toggle */}
              <ProviderBreakToggle />

              {/* Specific Budget Caps (Per-Request, Per-Provider Daily, Global Daily) */}
              <BudgetCaps />

              {/* Charts */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:24 }} className="grid-cols-1 lg:grid-cols-2">
                {[
                  { title:'API Requests', sub:'Monthly count', data:reqData, key:'v', grad:'reqG' },
                  { title:'Spending',     sub:'Monthly USD',   data:spendData, key:'v', grad:'spG' },
                ].map((c,ci) => (
                  <motion.div key={c.title} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5, delay:0.24+ci*0.07 }}
                    style={{ padding:'22px 20px', borderRadius:18, background:'rgba(14,14,16,0.95)', border:'1px solid rgba(255,255,255,0.07)' }}>
                    <div style={{ marginBottom:18 }}>
                      <h3 style={{ fontFamily:'Inter', fontSize:14, fontWeight:600, color:'#ccc', marginBottom:2 }}>{c.title}</h3>
                      <p style={{ fontFamily:'Inter', fontSize:12, color:'#3a3a3a' }}>{c.sub}</p>
                    </div>
                    <ResponsiveContainer width="100%" height={150}>
                      {ci === 0 ? (
                        <AreaChart data={c.data} margin={{ top:0,right:0,left:-28,bottom:0 }}>
                          <defs>
                            <linearGradient id={c.grad} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="rgba(160,185,255,0.18)" />
                              <stop offset="100%" stopColor="rgba(160,185,255,0)" />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                          <XAxis dataKey="m" tick={{ fill:'#333', fontSize:10, fontFamily:'Inter' }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill:'#333', fontSize:9, fontFamily:'Inter' }} axisLine={false} tickLine={false} />
                          <Tooltip content={<Tip />} />
                          <Area type="monotone" dataKey={c.key} stroke="rgba(160,185,255,0.45)" strokeWidth={2} fill={`url(#${c.grad})`} />
                        </AreaChart>
                      ) : (
                        <BarChart data={c.data} margin={{ top:0,right:0,left:-28,bottom:0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                          <XAxis dataKey="m" tick={{ fill:'#333', fontSize:10, fontFamily:'Inter' }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill:'#333', fontSize:9, fontFamily:'Inter' }} axisLine={false} tickLine={false} />
                          <Tooltip content={<Tip />} />
                          <Bar dataKey={c.key} fill="rgba(160,185,255,0.13)" radius={[5,5,0,0]} />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </motion.div>
                ))}
              </div>

              {/* Lightweight Recent Receipts Preview (Max 2 entries) */}
              <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5, delay:0.32 }} style={{ marginBottom: 24 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                  <div>
                    <h2 style={{ fontFamily:'Inter', fontSize:15, fontWeight:600, color:'#efefef' }}>Recent Execution Receipts</h2>
                    <p style={{ fontFamily:'Inter', fontSize:12, color:'#555', marginTop:2 }}>Showing latest execution receipts</p>
                  </div>
                  <Link
                    href="/provenance"
                    style={{
                      display:'flex', alignItems:'center', gap:5, fontFamily:'Inter', fontSize:12, color:'#80a5e5', textDecoration:'none', fontWeight:500
                    }}
                  >
                    View all in Provenance Store <ArrowUpRight size={13} />
                  </Link>
                </div>

                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  {receipts.slice(0, 2).map((rcpt) => (
                    <ReceiptCard key={rcpt.receiptId} receipt={rcpt} />
                  ))}
                </div>
              </motion.div>

              {/* Active APIs */}
              <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5, delay:0.36 }}
                style={{ padding:'22px 20px', borderRadius:18, background:'rgba(14,14,16,0.95)', border:'1px solid rgba(255,255,255,0.07)', marginBottom:24 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
                  <h3 style={{ fontFamily:'Inter', fontSize:14, fontWeight:600, color:'#ccc' }}>Active APIs</h3>
                  <Link href="/marketplace" style={{ display:'flex', alignItems:'center', gap:4, fontFamily:'Inter', fontSize:12, color:'#333', textDecoration:'none' }}>Browse more <ChevronRight size={11} /></Link>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                  {myAPIs.map(a => (
                    <div key={a.name} style={{ display:'flex', alignItems:'center', gap:14 }}>
                      <div style={{ width:8, height:8, borderRadius:'50%', background: a.status === 'active' ? '#5a9a5a' : '#c8a032', boxShadow: a.status === 'active' ? '0 0 6px rgba(74,138,74,0.8)' : '0 0 6px rgba(200,160,50,0.8)' }} />
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                          <span style={{ fontFamily:'Inter', fontSize:13, fontWeight:600, color:'#e0e0e0' }}>{a.name}</span>
                          <span style={{ fontFamily:'Inter', fontSize:12, color:'#444' }}>{a.used} / {a.cap} ({a.pct}%)</span>
                        </div>
                        <div style={{ height:4, borderRadius:2, background:'rgba(255,255,255,0.05)', overflow:'hidden' }}>
                          <div style={{ height:'100%', width:`${a.pct}%`, background: a.status === 'active' ? 'rgba(74,138,74,0.6)' : 'rgba(200,160,50,0.6)', borderRadius:2 }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
