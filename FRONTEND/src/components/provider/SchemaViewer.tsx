'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SchemaViewerProps {
    inputSchema?: string;
    outputSchema?: string;
}

const CodeBlock = ({ code }: { code: string }) => (
    <div style={{
        background: 'rgba(10,10,12,0.6)',
        borderRadius: 12,
        padding: '16px',
        overflowX: 'auto',
        border: '1px solid rgba(255,255,255,0.04)',
        fontFamily: 'monospace',
        fontSize: 13,
        lineHeight: 1.6,
        color: '#d4d4d4',
        margin: '12px 0'
    }}>
        <pre style={{ margin: 0 }}>
            <code>{code}</code>
        </pre>
    </div>
);

export default function SchemaViewer({ inputSchema, outputSchema }: SchemaViewerProps) {
    const [openSection, setOpenSection] = useState<'input' | 'output' | null>('input');

    const inSchema = inputSchema || '{\n  "error": "No schema provided"\n}';
    const outSchema = outputSchema || '{\n  "error": "No schema provided"\n}';

    return (
        <div style={{
            borderRadius: 20,
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            overflow: 'hidden',
        }}>
            <div style={{
                padding: '20px 24px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
            }}>
                <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: 'rgba(255,255,255,0.05)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center'
                }}>
                    <Check size={16} color="#777" />
                </div>
                <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#e0e0e0' }}>
                    API Schema Definition
                </h3>
            </div>

            <div>
                {/* Input Schema Accodion */}
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <button
                        onClick={() => setOpenSection(openSection === 'input' ? null : 'input')}
                        style={{
                            width: '100%',
                            padding: '16px 24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#bbb',
                            fontFamily: 'Inter, sans-serif',
                            fontSize: 14,
                            fontWeight: 500,
                        }}
                    >
                        <span>Input Schema (Request payload)</span>
                        <ChevronDown
                            size={16}
                            style={{
                                transition: 'transform 0.2s',
                                transform: openSection === 'input' ? 'rotate(180deg)' : 'none',
                            }}
                        />
                    </button>
                    <AnimatePresence>
                        {openSection === 'input' && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                style={{ overflow: 'hidden' }}
                            >
                                <div style={{ padding: '0 24px 20px' }}>
                                    <CodeBlock code={inSchema} />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Output Schema Accodion */}
                <div>
                    <button
                        onClick={() => setOpenSection(openSection === 'output' ? null : 'output')}
                        style={{
                            width: '100%',
                            padding: '16px 24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#bbb',
                            fontFamily: 'Inter, sans-serif',
                            fontSize: 14,
                            fontWeight: 500,
                        }}
                    >
                        <span>Output Schema (Response payload)</span>
                        <ChevronDown
                            size={16}
                            style={{
                                transition: 'transform 0.2s',
                                transform: openSection === 'output' ? 'rotate(180deg)' : 'none',
                            }}
                        />
                    </button>
                    <AnimatePresence>
                        {openSection === 'output' && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                style={{ overflow: 'hidden' }}
                            >
                                <div style={{ padding: '0 24px 20px' }}>
                                    <CodeBlock code={outSchema} />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
