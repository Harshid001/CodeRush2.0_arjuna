'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Activity, DollarSign, Zap, Database, ArrowUpRight, Clock, User, Settings, LogOut, ChevronRight, Download, FileText } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BudgetCaps from '@/components/BudgetCaps';
import ReceiptCard from '@/components/ReceiptCard';
import ProviderBreakToggle from '@/components/ProviderBreakToggle';
import { useReceipts } from '@/lib/receiptStore';

const reqData    = [{ m:'Jan',v:12000},{m:'Feb',v:18000},{m:'Mar',v:15000},{m:'Apr',v:22000},{m:'May',v:28000},{m:'Jun',v:24000},{m:'Jul',v:35000},{m:'Aug',v:42000}];
const spendData  = [{ m:'Jan',v:48},{m:'Feb',v:72},{m:'Mar',v:61},{m:'Apr',v:88},{m:'May',v:115},{m:'Jun',v:98},{m:'Jul',v:142},{m:'Aug',v:167}];

const txns = [
  { api:'GPT-4 Vision Pro',  provider:'OpenCore Labs',  reqs:4200,  amt:'$17.64', date:'Aug 6', chain:'ETH' },
  { api:'Whisper STT Ultra', provider:'AudioAI Systems',reqs:8100,  amt:'$14.58', date:'Aug 5', chain:'SOL' },
  { api:'EmbedForce v3',     provider:'VectorCore',     reqs:45000, amt:'$13.50', date:'Aug 4', chain:'ETH' },
  { api:'Claude Inference',  provider:'Anthropos Cloud',reqs:1800,  amt:'$9.90',  date:'Aug 3', chain:'POL' },
  { api:'DataStream ML',     provider:'NexusDB Corp',   reqs:22000, amt:'$26.40', date:'Aug 2', chain:'ARB' },
];

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
  { label:'Overview',     icon:Activity  },
  { label:'My APIs',      icon:Database  },
  { label:'Spending',     icon:DollarSign},
  { label:'Transactions', icon:Clock     },
  { label:'Receipts',     icon:FileText  },
  { label:'Settings',     icon:Settings  },
];

export default function Dashboard() {
  const { receipts, exportReceiptsCSV, exportReceiptsJSON } = useReceipts();

  return (
    <div style={{ background:'#050505', minHeight:'100vh' }}>
      <Navbar />
      <main style={{ paddingTop:88, paddingBottom:80 }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 28px' }}>
          <div style={{ display:'flex', gap:28, marginTop:20 }}>

            {/* Sidebar */}
            <motion.aside initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.5 }}
              style={{ width:200, flexShrink:0, display:'flex', flexDirection:'column', gap:4 }} className="hidden lg:flex">
              {/* Profile */}
              <div style={{ padding:'16px', borderRadius:16, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', marginBottom:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                  <div style={{ width:34, height:34, borderRadius:10, background:'rgba(255,255,255,0.07)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <User size={15} color="#888" />
                  </div>
                  <div>
                    <div style={{ fontFamily:'Inter', fontSize:13, fontWeight:600, color:'#ccc' }}>Alex Morgan</div>
                    <div style={{ fontFamily:'Inter', fontSize:11, color:'#3a3a3a' }}>Developer</div>
                  </div>
                </div>
                <div style={{ padding:'7px 10px', borderRadius:9, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', fontFamily:'monospace', fontSize:11, color:'#3a3a3a', overflow:'hidden', textOverflow:'ellipsis' }}>
                  0x71C...9E23
                </div>
              </div>
              {navItems.map(item => (
                <button key={item.label} style={{
                  display:'flex', alignItems:'center', gap:10, padding:'10px 13px', borderRadius:12,
                  border:'1px solid transparent', background:'transparent',
                  fontFamily:'Inter', fontSize:13, fontWeight:500, color:'#4a4a4a', cursor:'pointer',
                  textAlign:'left', transition:'all 0.2s', width:'100%',
                }}
                  onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.background='rgba(255,255,255,0.05)';(e.currentTarget as HTMLButtonElement).style.color='#bbb';(e.currentTarget as HTMLButtonElement).style.borderColor='rgba(255,255,255,0.08)';}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.background='transparent';(e.currentTarget as HTMLButtonElement).style.color='#4a4a4a';(e.currentTarget as HTMLButtonElement).style.borderColor='transparent';}}>
                  <item.icon size={14} />
                  {item.label}
                </button>
              ))}
              <div style={{ marginTop:'auto', paddingTop:16 }}>
                <button style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 13px', borderRadius:12, border:'none', background:'transparent', fontFamily:'Inter', fontSize:13, color:'#333', cursor:'pointer' }}>
                  <LogOut size={13} /> Sign out
                </button>
              </div>
            </motion.aside>

            {/* Main Content */}
            <div style={{ flex:1, minWidth:0 }}>
              <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:28, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
                <div>
                  <h1 style={{ fontFamily:'Playfair Display, Georgia, serif', fontWeight:600, fontSize:'2rem', color:'#efefef', letterSpacing:'-0.025em', marginBottom:4 }}>Dashboard</h1>
                  <p style={{ fontFamily:'Inter', fontSize:13, color:'#444' }}>Welcome back, Alex · Real-time receipt tracking active</p>
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
                    <p style={{ fontFamily:'Inter', fontSize:12, color:'#555', marginTop:2 }}>Showing latest 2 execution receipts</p>
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
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:7 }}>
                          <span style={{ fontFamily:'Inter', fontSize:13, fontWeight:500, color:'#bbb' }}>{a.name}</span>
                          <span style={{ fontFamily:'Inter', fontSize:11, color:'#444' }}>{a.used} / {a.cap}</span>
                        </div>
                        <div style={{ height:5, borderRadius:3, background:'rgba(255,255,255,0.06)', overflow:'hidden' }}>
                          <motion.div initial={{ width:0 }} animate={{ width:`${a.pct}%` }} transition={{ duration:0.9, ease:'easeOut' }}
                            style={{ height:'100%', borderRadius:3, background: a.status==='warning' ? 'rgba(180,140,70,0.55)' : 'rgba(160,185,255,0.28)' }} />
                        </div>
                      </div>
                      <span style={{ fontFamily:'Inter', fontSize:11, fontWeight:600, padding:'3px 9px', borderRadius:100, flexShrink:0,
                        background: a.status==='warning' ? 'rgba(160,120,50,0.1)' : 'rgba(70,120,70,0.1)',
                        color:      a.status==='warning' ? '#9a7a40' : '#4a8a4a',
                        border: `1px solid ${a.status==='warning' ? 'rgba(160,120,50,0.2)' : 'rgba(70,120,70,0.2)'}`,
                      }}>{a.pct}%</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Transactions */}
              <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5, delay:0.42 }}
                style={{ borderRadius:18, overflow:'hidden', border:'1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ padding:'18px 20px', background:'rgba(14,14,16,0.95)', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <h3 style={{ fontFamily:'Inter', fontSize:14, fontWeight:600, color:'#ccc' }}>Recent Transactions</h3>
                  <Link href="/provenance" style={{ display:'flex', alignItems:'center', gap:4, fontFamily:'Inter', fontSize:12, color:'#80a5e5', textDecoration:'none' }}>View all in Provenance Store <ChevronRight size={11} /></Link>
                </div>
                <div style={{ background:'rgba(10,10,12,0.95)' }}>
                  {txns.map((tx,i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px', borderBottom: i<txns.length-1 ? '1px solid rgba(255,255,255,0.04)' : 'none', transition:'background 0.15s', cursor:'pointer' }}
                      onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.background='rgba(255,255,255,0.02)';}}
                      onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.background='transparent';}}>
                      <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                        <div style={{ width:32, height:32, borderRadius:10, background:'rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <Zap size={13} color="#555" />
                        </div>
                        <div>
                          <div style={{ fontFamily:'Inter', fontSize:13, fontWeight:500, color:'#bbb', marginBottom:2 }}>{tx.api}</div>
                          <div style={{ fontFamily:'Inter', fontSize:11, color:'#333' }}>{tx.reqs.toLocaleString()} req · {tx.chain}</div>
                        </div>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                        <span style={{ fontFamily:'Inter', fontSize:12, color:'#2a2a2a' }}>{tx.date}</span>
                        <span style={{ fontFamily:'Inter', fontSize:14, fontWeight:600, color:'#888' }}>{tx.amt}</span>
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
