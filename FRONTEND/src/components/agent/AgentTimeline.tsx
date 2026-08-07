'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, AlertCircle, Circle, ArrowDown } from 'lucide-react';

export interface TimelineStep {
  id: string;
  label: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  details?: string;
}

interface AgentTimelineProps {
  steps: TimelineStep[];
  currentStepIndex: number;
}

export default function AgentTimeline({ steps, currentStepIndex }: AgentTimelineProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      style={{
        borderRadius: 24,
        backgroundColor: 'rgba(15, 15, 20, 0.85)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '32px 36px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(20px)',
        marginBottom: 32,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#ffffff', margin: 0 }}>
          Autonomous Execution Timeline
        </h3>
        <span style={{ fontSize: 12, color: '#00e5ff', fontFamily: 'monospace', fontWeight: 600 }}>
          {currentStepIndex >= 0 && currentStepIndex < steps.length
            ? `Step ${currentStepIndex + 1} of ${steps.length}`
            : currentStepIndex >= steps.length
            ? 'Execution Completed'
            : 'Idle'}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {steps.map((step, idx) => {
          const isDone = step.status === 'completed';
          const isActive = step.status === 'active';
          const isFailed = step.status === 'failed';
          const isPending = step.status === 'pending';

          return (
            <React.Fragment key={step.id}>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 16,
                  padding: '14px 18px',
                  borderRadius: 14,
                  backgroundColor: isActive
                    ? 'rgba(0, 229, 255, 0.08)'
                    : isDone
                    ? 'rgba(16, 185, 129, 0.05)'
                    : isFailed
                    ? 'rgba(239, 68, 68, 0.08)'
                    : 'rgba(255, 255, 255, 0.02)',
                  border: isActive
                    ? '1px solid rgba(0, 229, 255, 0.3)'
                    : isDone
                    ? '1px solid rgba(16, 185, 129, 0.2)'
                    : isFailed
                    ? '1px solid rgba(239, 68, 68, 0.3)'
                    : '1px solid rgba(255, 255, 255, 0.05)',
                  transition: 'all 0.25s ease',
                }}
              >
                {/* Step Icon */}
                <div style={{ marginTop: 2, flexShrink: 0 }}>
                  {isDone ? (
                    <CheckCircle2 size={18} color="#10b981" />
                  ) : isActive ? (
                    <Loader2 size={18} color="#00e5ff" className="animate-spin-slow" />
                  ) : isFailed ? (
                    <AlertCircle size={18} color="#ef4444" />
                  ) : (
                    <Circle size={18} color="#444455" />
                  )}
                </div>

                {/* Step Text & Details */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: isDone
                          ? '#10b981'
                          : isActive
                          ? '#00e5ff'
                          : isFailed
                          ? '#ef4444'
                          : '#888899',
                      }}
                    >
                      {step.label}
                    </span>
                    <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#666677' }}>
                      {step.status.toUpperCase()}
                    </span>
                  </div>

                  <p style={{ fontSize: 12, color: '#9999aa', margin: 0, marginTop: 4, lineHeight: 1.4 }}>
                    {step.description}
                  </p>

                  {step.details && (
                    <div
                      style={{
                        marginTop: 8,
                        padding: '6px 10px',
                        borderRadius: 8,
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        fontSize: 11,
                        fontFamily: 'monospace',
                        color: '#00e5ff',
                      }}
                    >
                      {step.details}
                    </div>
                  )}
                </div>
              </motion.div>

              {idx < steps.length - 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', margin: '-8px 0 -8px 24px' }}>
                  <div style={{ width: 2, height: 12, backgroundColor: isDone ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 255, 255, 0.08)' }} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </motion.div>
  );
}
