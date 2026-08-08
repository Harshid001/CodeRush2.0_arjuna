'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { DecisionReport } from '@/services/agent/MarketplaceAgent';
import type { AgentExecutionRecord } from '@/services/agent/ExecutionService';
import type { Receipt } from '@/lib/x402/types';

export type AgentStage =
  | 'idle'
  | 'understanding_request'
  | 'searching_marketplace'
  | 'comparing_providers'
  | 'running_policy_engine'
  | 'running_decision_engine'
  | 'selecting_provider'
  | 'creating_payment_session'
  | 'waiting_wallet_signature'
  | 'payment_confirmed'
  | 'provider_executed'
  | 'result_generated'
  | 'receipt_generated'
  | 'invoice_generated'
  | 'completed'
  | 'failed';

interface AgentContextType {
  stage: AgentStage;
  currentStepIndex: number;
  prompt: string;
  report: DecisionReport | null;
  activeTxHash: string | null;
  receipt: Receipt | null;
  record: AgentExecutionRecord | null;
  error: string | null;
  setStage: (stage: AgentStage, index?: number) => void;
  startExecution: (userPrompt: string) => void;
  setReport: (report: DecisionReport) => void;
  setReceiptAndRecord: (receipt: Receipt, record: AgentExecutionRecord, txHash: string) => void;
  setError: (err: string) => void;
  resetAgent: () => void;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export function AgentProvider({ children }: { children: React.ReactNode }) {
  const [stage, setStageState] = useState<AgentStage>('idle');
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [prompt, setPrompt] = useState('');
  const [report, setReportState] = useState<DecisionReport | null>(null);
  const [activeTxHash, setActiveTxHash] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [record, setRecord] = useState<AgentExecutionRecord | null>(null);
  const [error, setErrorState] = useState<string | null>(null);

  const setStage = useCallback((newStage: AgentStage, index?: number) => {
    setStageState(newStage);
    if (typeof index === 'number') {
      setCurrentStepIndex(index);
    }
  }, []);

  const startExecution = useCallback((userPrompt: string) => {
    setPrompt(userPrompt);
    setReportState(null);
    setActiveTxHash(null);
    setReceipt(null);
    setRecord(null);
    setErrorState(null);
    setStageState('understanding_request');
    setCurrentStepIndex(0);
  }, []);

  const setReport = useCallback((rep: DecisionReport) => {
    setReportState(rep);
  }, []);

  const setReceiptAndRecord = useCallback((r: Receipt, rec: AgentExecutionRecord, txHash: string) => {
    setReceipt(r);
    setRecord(rec);
    setActiveTxHash(txHash);
  }, []);

  const setError = useCallback((err: string) => {
    setErrorState(err);
    setStageState('failed');
  }, []);

  const resetAgent = useCallback(() => {
    setStageState('idle');
    setCurrentStepIndex(-1);
    setPrompt('');
    setReportState(null);
    setActiveTxHash(null);
    setReceipt(null);
    setRecord(null);
    setErrorState(null);
  }, []);

  return (
    <AgentContext.Provider
      value={{
        stage,
        currentStepIndex,
        prompt,
        report,
        activeTxHash,
        receipt,
        record,
        error,
        setStage,
        startExecution,
        setReport,
        setReceiptAndRecord,
        setError,
        resetAgent,
      }}
    >
      {children}
    </AgentContext.Provider>
  );
}

export function useAgentContext() {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error('useAgentContext must be used within an AgentProvider');
  }
  return context;
}
