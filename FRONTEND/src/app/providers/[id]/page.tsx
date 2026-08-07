// Next.js standard async server component
import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProviderById } from '@/lib/data/marketplaceApis';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProviderDetailsCard from '@/components/provider/ProviderDetailsCard';
import SchemaViewer from '@/components/provider/SchemaViewer';
import PricingCard from '@/components/provider/PricingCard';
import { ArrowLeft, Brain, Eye, Mic, Code2, Activity, Database, Globe, Zap } from 'lucide-react';

const ICONS: Record<string, React.ElementType> = { brain: Brain, eye: Eye, mic: Mic, code: Code2, activity: Activity, database: Database, globe: Globe, zap: Zap };

export default async function ProviderDetailsPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const api = await getProviderById(params.id);

    if (!api) {
        return (
            <div style={{ background: '#050505', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <Navbar />
                <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                        <h1 style={{ fontFamily: 'Playfair Display', fontSize: 32, color: '#fff', marginBottom: 16 }}>Provider not found</h1>
                        <p style={{ fontFamily: 'Inter', color: '#666', marginBottom: 24 }}>The API provider you are looking for does not exist or has been removed.</p>
                        <Link href="/marketplace" style={{ color: '#5a9a5a', textDecoration: 'none', fontFamily: 'Inter' }}>
                            &larr; Back to Marketplace
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const Icon = ICONS[api.icon] || Database;

    return (
        <div style={{ background: '#050505', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main style={{ flex: 1, paddingTop: 100, paddingBottom: 120 }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px' }}>

                    <Link href="/marketplace" style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        color: '#777', fontFamily: 'Inter', fontSize: 13, textDecoration: 'none',
                        marginBottom: 40, transition: 'color 0.2s'
                    }}>
                        <ArrowLeft size={14} /> Back to Marketplace
                    </Link>

                    {/* Hero Section */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 56 }}>
                        <div style={{
                            width: 72, height: 72, borderRadius: 20,
                            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}>
                            <Icon size={32} color="#888" />
                        </div>
                        <div>
                            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#efefef', marginBottom: 6 }}>
                                {api.name}
                            </h1>
                            <p style={{ fontFamily: 'Inter', fontSize: 15, color: '#888' }}>
                                by <span style={{ color: '#aaa', fontWeight: 500 }}>{api.provider}</span>
                            </p>
                        </div>
                    </div>

                    {/* Main Layout */}
                    <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                        {/* Left Content Column */}
                        <div style={{ flex: '1 1 600px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 24 }}>
                            <ProviderDetailsCard api={api} />
                            <SchemaViewer inputSchema={api.inputSchema} outputSchema={api.outputSchema} />
                        </div>

                        {/* Right Sidebar Column */}
                        <div style={{ flex: '0 0 340px' }} className="pricing-sidebar">
                            <PricingCard api={api} />
                        </div>
                    </div>

                </div>
            </main>
            <Footer />
            <style>{`
        @media (max-width: 900px) {
          .pricing-sidebar {
            flex: 1 1 100% !important;
          }
        }
      `}</style>
        </div>
    );
}
