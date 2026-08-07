'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Bot } from 'lucide-react';

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
        borderRadius: 20,
        backgroundColor: 'rgba(14, 14, 16, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.07)',
        padding: '28px 32px',
        boxShadow: '0 4px 32px rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(20px)',
        marginBottom: 32,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Bot size={18} color="#888888" />
        </div>
        <div>
          <h2 style={{ fontFamily: 'Inter', fontSize: 16, fontWeight: 600, color: '#e0e0e0', margin: 0 }}>
            AI Agent Task Prompt
          </h2>
          <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#555555', margin: 0, marginTop: 2 }}>
            Describe your requirement. The autonomous engine will discover, evaluate policy, and purchase the best API.
          </p>
        </div>
      </div>

      {/* Main Textarea */}
      <div style={{ position: 'relative', marginTop: 16 }}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. Extract invoice text and line items from a scan, max budget $0.05 per request with high accuracy..."
          disabled={isRunning}
          rows={4}
          style={{
            width: '100%',
            padding: '16px 20px',
            borderRadius: 14,
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#e0e0e0',
            fontSize: 14,
            fontFamily: "'Inter', sans-serif",
            lineHeight: 1.6,
            outline: 'none',
            resize: 'vertical',
            boxSizing: 'border-box',
            transition: 'all 0.2s ease',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
          }}
        />
      </div>

      {/* Shortcuts & Action Row */}
      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <span style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 600, color: '#444444', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 10 }}>
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
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  color: '#666666',
                  fontSize: 12,
                  fontFamily: 'Inter',
                  cursor: isRunning ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.07)';
                  e.currentTarget.style.color = '#cccccc';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.color = '#666666';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                }}
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 4 }}>
          <button
            type="button"
            onClick={onStartAgent}
            disabled={isRunning || !prompt.trim()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 24px',
              borderRadius: 12,
              backgroundColor: isRunning || !prompt.trim()
                ? 'rgba(255, 255, 255, 0.04)'
                : 'rgba(255, 255, 255, 0.09)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: isRunning || !prompt.trim() ? '#444444' : '#ffffff',
              fontSize: 14,
              fontWeight: 600,
              fontFamily: 'Inter',
              cursor: isRunning || !prompt.trim() ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!isRunning && prompt.trim()) {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.14)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isRunning && prompt.trim()) {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.09)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
              }
            }}
          >
            <span>{isRunning ? 'Executing Agent Pipeline...' : 'Start Agent'}</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
