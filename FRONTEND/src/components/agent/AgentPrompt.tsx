'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Zap, FileText, Globe, Key, ShieldCheck, Activity, Camera, MapPin } from 'lucide-react';

interface AgentPromptProps {
  prompt: string;
  setPrompt: (v: string) => void;
  onStartAgent: () => void;
  isRunning: boolean;
}

const EXAMPLES = [
  { label: '📄 Extract text from an invoice', prompt: 'Extract structured text and line items from an uploaded invoice PDF scan' },
  { label: '🌐 Translate PDF into Hindi', prompt: 'Translate technical documentation PDF from English into Hindi with high accuracy' },
  { label: '🔢 Generate embeddings', prompt: 'Generate high-dimensional vector embeddings for semantic search under $0.01 per batch' },
  { label: '🛡️ Moderate this text', prompt: 'Moderate user comments for toxic speech and spam under 100ms latency' },
  { label: '⚡ Risk score this transaction', prompt: 'Evaluate fraud risk score for high-value Algorand payment transaction' },
  { label: '🎙️ Transcribe meeting audio', prompt: 'Transcribe 10-minute meeting audio with speaker diarization' },
  { label: '🎨 Generate product images', prompt: 'Generate 4K resolution product render image with studio lighting' },
  { label: '🗺️ Geocode address', prompt: 'Geocode business street address into GPS latitude longitude coordinates' },
];

export default function AgentPrompt({ prompt, setPrompt, onStartAgent, isRunning }: AgentPromptProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        borderRadius: 24,
        backgroundColor: 'rgba(15, 15, 20, 0.85)',
        border: '1px solid rgba(0, 229, 255, 0.25)',
        padding: '32px 36px',
        boxShadow: '0 30px 80px rgba(0, 0, 0, 0.8), 0 0 40px rgba(0, 210, 255, 0.08)',
        backdropFilter: 'blur(20px)',
        marginBottom: 32,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.2), rgba(168, 85, 247, 0.2))',
            border: '1px solid rgba(0, 229, 255, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Sparkles size={20} color="#00e5ff" />
        </div>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#ffffff', margin: 0, letterSpacing: '-0.01em' }}>
            AI Agent Task Prompt
          </h2>
          <p style={{ fontSize: 13, color: '#888899', margin: 0, marginTop: 2 }}>
            Enter your requirements. The agent will discover, compare, and purchase the optimal API for you.
          </p>
        </div>
      </div>

      {/* Main Textarea */}
      <div style={{ position: 'relative', marginTop: 20 }}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. Extract invoice text and line items from a scan, max budget $0.05 per request with high accuracy..."
          disabled={isRunning}
          rows={4}
          style={{
            width: '100%',
            padding: '16px 20px',
            borderRadius: 16,
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#ffffff',
            fontSize: 15,
            fontFamily: "'Inter', sans-serif",
            lineHeight: 1.6,
            outline: 'none',
            resize: 'vertical',
            boxSizing: 'border-box',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#00e5ff';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 229, 255, 0.15)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
      </div>

      {/* Shortcuts & Action Row */}
      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#666677', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 10 }}>
            Example Prompts (Click to Use)
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {EXAMPLES.map((ex) => (
              <button
                key={ex.label}
                type="button"
                onClick={() => setPrompt(ex.prompt)}
                disabled={isRunning}
                style={{
                  padding: '7px 13px',
                  borderRadius: 10,
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#cccccc',
                  fontSize: 12,
                  fontFamily: 'Inter',
                  cursor: isRunning ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(0, 229, 255, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.3)';
                  e.currentTarget.style.color = '#00e5ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.color = '#cccccc';
                }}
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
          <button
            type="button"
            onClick={onStartAgent}
            disabled={isRunning || !prompt.trim()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '14px 28px',
              borderRadius: 14,
              background: isRunning || !prompt.trim()
                ? 'rgba(255, 255, 255, 0.1)'
                : 'linear-gradient(135deg, #00e5ff 0%, #00a8ff 100%)',
              color: isRunning || !prompt.trim() ? '#666677' : '#000000',
              fontSize: 15,
              fontWeight: 700,
              fontFamily: 'Inter',
              border: 'none',
              cursor: isRunning || !prompt.trim() ? 'not-allowed' : 'pointer',
              boxShadow: isRunning || !prompt.trim() ? 'none' : '0 10px 30px rgba(0, 229, 255, 0.35)',
              transition: 'transform 0.15s ease, opacity 0.2s',
            }}
            onMouseDown={(e) => {
              if (!isRunning && prompt.trim()) e.currentTarget.style.transform = 'scale(0.97)';
            }}
            onMouseUp={(e) => {
              if (!isRunning && prompt.trim()) e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <span>{isRunning ? 'Agent Executing...' : 'Start Agent'}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
