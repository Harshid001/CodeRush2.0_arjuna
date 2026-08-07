'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProvenanceViewer from '@/components/ProvenanceViewer';

export default function ProvenancePage() {
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
              Cryptographic Audit & Data Provenance
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
              Provenance Store
            </h1>
            <p style={{ fontFamily: 'Inter', fontSize: 14, color: '#555555', maxWidth: 640, lineHeight: 1.6 }}>
              Verify the complete chain of custody for any paid API invocation. Re-hash raw payloads live in browser
              with Web Crypto SHA-256 to prove zero data tampering.
            </p>
          </motion.div>

          <ProvenanceViewer />
        </div>
      </main>

      <Footer />
    </div>
  );
}
