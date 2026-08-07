'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TraceViewer from '@/components/TraceViewer';

export default function TracePage() {
  return (
    <div style={{ background: '#050505', minHeight: '100vh' }}>
      <Navbar />

      <main style={{ paddingTop: 100, paddingBottom: 120 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px' }}>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ marginBottom: 40 }}
          >
            <p
              style={{
                fontFamily: 'Inter',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#555555',
                marginBottom: 12,
              }}
            >
              Execution Lifecycle & Policy Audit
            </p>
            <h1
              style={{
                fontFamily: 'Playfair Display, Georgia, serif',
                fontWeight: 600,
                fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
                color: '#efefef',
                letterSpacing: '-0.025em',
                marginBottom: 8,
              }}
            >
              Trace Viewer
            </h1>
            <p style={{ fontFamily: 'Inter', fontSize: 14, color: '#555555', maxWidth: 620, lineHeight: 1.6 }}>
              Real-time audit log of agent API invocations showing HTTP 402 payment negotiation,
              policy engine rule evaluation, and Base Sepolia on-chain settlement.
            </p>
          </motion.div>

          <TraceViewer />
        </div>
      </main>

      <Footer />
    </div>
  );
}
