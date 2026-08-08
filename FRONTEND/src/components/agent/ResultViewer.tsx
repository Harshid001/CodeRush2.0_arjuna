'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Languages, Brain, Binary, MessageSquare, Image, ShieldAlert, ShieldCheck, MapPin, Smile } from 'lucide-react';

interface ResultViewerProps {
  category: string;
  result: any;
}

export default function ResultViewer({ category, result }: ResultViewerProps) {
  const cat = (category || '').toLowerCase().trim();

  // Helper to format JSON securely
  const formatJson = (val: any) => JSON.stringify(val, null, 2);

  // 1. OCR Format
  if (cat === 'ocr') {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <Eye size={18} color="#00e5ff" />
          <span style={styles.headerTitle}>Extracted Document Text</span>
        </div>
        <div style={styles.ocrTextWrapper}>
          <pre style={styles.preText}>{result.text || 'No text extracted.'}</pre>
        </div>
        <div style={styles.metaRow}>
          <div style={styles.metaCol}>
            <span style={styles.metaLabel}>Confidence</span>
            <span style={styles.metaVal}>{((result.confidence || 0.98) * 100).toFixed(0)}%</span>
          </div>
          <div style={styles.metaCol}>
            <span style={styles.metaLabel}>Language Detected</span>
            <span style={styles.metaVal}>{result.language || 'English'}</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. TRANSLATION Format
  if (cat === 'translation') {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <Languages size={18} color="#00e5ff" />
          <span style={styles.headerTitle}>Translation Result ({result.targetLanguage || 'Hindi'})</span>
        </div>
        <div style={styles.translationGrid}>
          <div style={styles.translationBox}>
            <span style={styles.translationLabel}>Source Text (English)</span>
            <p style={styles.translationText}>{result.original || 'Hello World'}</p>
          </div>
          <div style={styles.translationArrow}>➔</div>
          <div style={styles.translationBoxActive}>
            <span style={styles.translationLabelActive}>Translated Text</span>
            <p style={styles.translationTextActive}>{result.translated || 'नमस्ते दुनिया'}</p>
          </div>
        </div>
        <div style={styles.metaRow}>
          <div style={styles.metaCol}>
            <span style={styles.metaLabel}>Accuracy confidence</span>
            <span style={styles.metaVal}>{((result.confidence || 0.97) * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>
    );
  }

  // 3. EMBEDDINGS Format
  if (cat === 'embeddings') {
    const vectorList = result.vector || [];
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <Brain size={18} color="#00e5ff" />
          <span style={styles.headerTitle}>Deterministic Vector Embedding ({result.dimensions || 8} Dimensions)</span>
        </div>
        <p style={styles.explanationText}>Generated vector representation weights representation:</p>
        <div style={styles.vectorListContainer}>
          {vectorList.map((val: number, idx: number) => (
            <div key={idx} style={styles.vectorBadge}>
              <span style={styles.vectorIdx}>[{idx}]</span>
              <span style={styles.vectorVal}>{val.toFixed(3)}</span>
            </div>
          ))}
        </div>
        <div style={styles.ocrTextWrapper}>
          <pre style={styles.preJson}>{formatJson(result)}</pre>
        </div>
      </div>
    );
  }

  // 4. SENTIMENT ANALYSIS Format
  if (cat === 'sentiment analysis' || cat === 'sentiment') {
    const sentiment = (result.sentiment || 'neutral').toLowerCase();
    const color = sentiment === 'positive' ? '#4ade80' : sentiment === 'negative' ? '#f87171' : '#fbbf24';
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <Smile size={18} color={color} />
          <span style={styles.headerTitle}>Sentiment & Emotion Extraction</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '14px 0' }}>
          <div style={{
            padding: '8px 20px',
            borderRadius: 12,
            backgroundColor: `${color}15`,
            border: `1px solid ${color}40`,
            color: color,
            fontWeight: 700,
            textTransform: 'uppercase',
            fontSize: 14,
            letterSpacing: '0.05em'
          }}>
            {sentiment}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#666', marginBottom: 4 }}>
              <span>Sentiment Score Intensity</span>
              <span>{Math.round((result.score || 0.5) * 100)}%</span>
            </div>
            <div style={{ width: '100%', height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              <div style={{ width: `${(result.score || 0.5) * 100}%`, height: '100%', backgroundColor: color, borderRadius: 3 }} />
            </div>
          </div>
        </div>
        <div style={styles.metaRow}>
          <div style={styles.metaCol}>
            <span style={styles.metaLabel}>Analysis Confidence</span>
            <span style={styles.metaVal}>{((result.confidence || 0.97) * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>
    );
  }

  // 5. RISK SCORING Format
  if (cat === 'risk scoring') {
    const isLow = (result.riskLevel || 'low').toLowerCase() === 'low';
    const isMedium = (result.riskLevel || 'medium').toLowerCase() === 'medium';
    const riskColor = isLow ? '#4ade80' : isMedium ? '#fbbf24' : '#f87171';
    
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <ShieldAlert size={18} color={riskColor} />
          <span style={styles.headerTitle}>Transaction Risk Assessment</span>
        </div>
        <div style={{ display: 'flex', gap: 16, margin: '14px 0', alignItems: 'center' }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: 16,
            border: `1px solid ${riskColor}30`,
            backgroundColor: `${riskColor}10`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: 24, fontWeight: 800, color: riskColor }}>{result.riskScore || 23}</span>
            <span style={{ fontSize: 9, color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Score</span>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: '#777' }}>Risk Classification:</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: riskColor }}>{result.riskLevel || 'LOW'}</span>
            </div>
            <p style={{ fontSize: 12, color: '#555', margin: 0 }}>On-chain transaction heuristic checks passed.</p>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 8 }}>Evaluation Risk Factors</span>
          <ul style={{ paddingLeft: 16, margin: 0, fontSize: 12, color: '#aaa', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {(result.factors || []).map((factor: string, idx: number) => (
              <li key={idx} style={{ lineHeight: 1.4 }}>{factor}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  // 6. MODERATION Format
  if (cat === 'moderation') {
    const categories = result.categories || {};
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          {result.safe ? <ShieldCheck size={18} color="#4ade80" /> : <ShieldAlert size={18} color="#f87171" />}
          <span style={styles.headerTitle}>Content Moderation Check</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '12px 0' }}>
          <span style={{ fontSize: 13, color: '#888' }}>Safety Rating:</span>
          <span style={{
            fontSize: 13,
            fontWeight: 700,
            color: result.safe ? '#4ade80' : '#f87171'
          }}>
            {result.safe ? 'SAFE CONTENT' : 'VIOLATION DETECTED'}
          </span>
        </div>
        <div style={styles.moderationGrid}>
          {Object.entries(categories).map(([key, val]) => (
            <div key={key} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 14px',
              borderRadius: 10,
              backgroundColor: val ? 'rgba(248, 113, 113, 0.08)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${val ? 'rgba(248, 113, 113, 0.25)' : 'rgba(255, 255, 255, 0.04)'}`
            }}>
              <span style={{ fontSize: 12, textTransform: 'capitalize', color: val ? '#f87171' : '#888' }}>{key}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: val ? '#f87171' : '#4ade80' }}>
                {val ? 'FLAGGED' : 'PASSED'}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 7. GEOCODING Format
  if (cat === 'geocoding') {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <MapPin size={18} color="#00e5ff" />
          <span style={styles.headerTitle}>Simulated Geocoding Coordinates</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, margin: '14px 0' }}>
          <div style={styles.coordinateCard}>
            <span style={styles.coordinateLabel}>Latitude</span>
            <span style={styles.coordinateVal}>{result.latitude || 21.1458}</span>
          </div>
          <div style={styles.coordinateCard}>
            <span style={styles.coordinateLabel}>Longitude</span>
            <span style={styles.coordinateVal}>{result.longitude || 79.0882}</span>
          </div>
        </div>
        <div style={styles.metaRow}>
          <div style={styles.metaCol}>
            <span style={styles.metaLabel}>Matched Location</span>
            <span style={styles.metaVal}>{result.location || 'Nagpur, India'}</span>
          </div>
        </div>
      </div>
    );
  }

  // 8. TEXT GENERATION Format
  if (cat === 'text generation') {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <MessageSquare size={18} color="#00e5ff" />
          <span style={styles.headerTitle}>Simulated Large Language Model (LLM) Output</span>
        </div>
        <div style={styles.textGenBox}>
          <p style={styles.textGenParagraph}>{result.text || 'No text generated.'}</p>
        </div>
      </div>
    );
  }

  // 9. SPEECH-TO-TEXT Format
  if (cat === 'speech-to-text' || cat === 'speech') {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <MessageSquare size={18} color="#00e5ff" />
          <span style={styles.headerTitle}>Simulated Audio Transcription</span>
        </div>
        <div style={styles.ocrTextWrapper}>
          <p style={{ margin: 0, fontSize: 13, color: '#cccccc', fontStyle: 'italic', lineHeight: 1.6 }}>
            "{result.transcript || 'This is a simulated transcription result.'}"
          </p>
        </div>
        <div style={styles.metaRow}>
          <div style={styles.metaCol}>
            <span style={styles.metaLabel}>Language</span>
            <span style={styles.metaVal}>{result.language || 'English'}</span>
          </div>
          <div style={styles.metaCol}>
            <span style={styles.metaLabel}>Word Confidence</span>
            <span style={styles.metaVal}>{((result.confidence || 0.95) * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>
    );
  }

  // 10. IMAGE GENERATION Format
  if (cat === 'image generation') {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <Image size={18} color="#00e5ff" />
          <span style={styles.headerTitle}>Simulated Generated Asset</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '14px 0' }}>
          <div style={styles.imagePreviewWrapper}>
            <img
              src={result.imageUrl}
              alt={result.prompt || 'Generated'}
              style={styles.imageElement}
            />
          </div>
          <p style={{ fontSize: 12, color: '#666', fontStyle: 'italic', textAlign: 'center', marginTop: 10, maxWidth: 400 }}>
            "{result.prompt || 'Generated Prompt Description'}"
          </p>
        </div>
      </div>
    );
  }

  // Default JSON Fallback
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Binary size={18} color="#00e5ff" />
        <span style={styles.headerTitle}>Structured Output (Raw JSON)</span>
      </div>
      <div style={styles.ocrTextWrapper}>
        <pre style={styles.preJson}>{formatJson(result)}</pre>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    borderRadius: '16px',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    fontFamily: 'Inter, sans-serif'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '14px'
  },
  headerTitle: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#e0e0e0',
    letterSpacing: '-0.01em'
  },
  ocrTextWrapper: {
    padding: '16px',
    borderRadius: '12px',
    backgroundColor: 'rgba(0,0,0,0.4)',
    border: '1px solid rgba(255,255,255,0.04)',
    maxHeight: '260px',
    overflowY: 'auto' as const
  },
  preText: {
    margin: 0,
    fontSize: '13px',
    color: '#ccc',
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-word' as const,
    fontFamily: 'monospace',
    lineHeight: 1.5
  },
  preJson: {
    margin: 0,
    fontSize: '11px',
    color: '#8be9fd',
    whiteSpace: 'pre-wrap' as const,
    fontFamily: 'monospace'
  },
  metaRow: {
    display: 'flex',
    gap: '24px',
    marginTop: '14px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    paddingTop: '12px'
  },
  metaCol: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '3px'
  },
  metaLabel: {
    fontSize: '10px',
    color: '#555',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em'
  },
  metaVal: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#bbb'
  },
  translationGrid: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '12px 0'
  },
  translationBox: {
    flex: 1,
    padding: '14px',
    borderRadius: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255,255,255,0.04)'
  },
  translationBoxActive: {
    flex: 1,
    padding: '14px',
    borderRadius: '12px',
    backgroundColor: 'rgba(0, 229, 255, 0.05)',
    border: '1px solid rgba(0, 229, 255, 0.2)'
  },
  translationLabel: {
    fontSize: '10px',
    color: '#555',
    display: 'block',
    marginBottom: '6px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.03em'
  },
  translationLabelActive: {
    fontSize: '10px',
    color: '#00e5ff',
    display: 'block',
    marginBottom: '6px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.03em'
  },
  translationText: {
    margin: 0,
    fontSize: '13px',
    color: '#888',
    fontWeight: 500
  },
  translationTextActive: {
    margin: 0,
    fontSize: '14px',
    color: '#ffffff',
    fontWeight: 700
  },
  translationArrow: {
    fontSize: '18px',
    color: '#444'
  },
  explanationText: {
    fontSize: '12px',
    color: '#777',
    marginTop: 0,
    marginBottom: '10px'
  },
  vectorListContainer: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '6px',
    marginBottom: '14px'
  },
  vectorBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '5px 10px',
    borderRadius: '8px',
    backgroundColor: 'rgba(0, 229, 255, 0.05)',
    border: '1px solid rgba(0, 229, 255, 0.15)',
    fontSize: '11px',
    fontFamily: 'monospace'
  },
  vectorIdx: {
    color: '#00e5ff',
    fontWeight: 600
  },
  vectorVal: {
    color: '#ffffff'
  },
  moderationGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
    marginTop: '8px'
  },
  coordinateCard: {
    padding: '12px',
    borderRadius: '10px',
    backgroundColor: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.05)',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center'
  },
  coordinateLabel: {
    fontSize: '10px',
    color: '#555',
    textTransform: 'uppercase' as const,
    marginBottom: '4px'
  },
  coordinateVal: {
    fontSize: '15px',
    fontWeight: 700,
    color: '#00e5ff',
    fontFamily: 'monospace'
  },
  textGenBox: {
    padding: '16px',
    borderRadius: '12px',
    backgroundColor: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.04)'
  },
  textGenParagraph: {
    margin: 0,
    fontSize: '13px',
    color: '#cccccc',
    lineHeight: 1.7
  },
  imagePreviewWrapper: {
    width: '100%',
    maxWidth: '320px',
    height: '240px',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
    backgroundColor: '#0a0a0c'
  },
  imageElement: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const
  }
};
