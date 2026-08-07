"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import {
  PolicyLimits,
  Receipt,
  TransactionTrace,
  ApiKey,
  PendingApproval,
} from "../lib/x402/types";
import { generateId } from "../lib/utils";

interface SpendState {
  today: number;
  todayByProvider: Record<string, number>;
}

interface PaymentContextType {
  policyLimits: PolicyLimits;
  spendToday: SpendState;
  receipts: Receipt[];
  traces: TransactionTrace[];
  usedNonces: Set<string>;
  apiKeys: ApiKey[];
  pendingApprovals: PendingApproval[];
  activeTraceId: string | null;
  updatePolicyLimits: (limits: Partial<PolicyLimits>) => void;
  addReceipt: (receipt: Receipt) => void;
  addTrace: (trace: TransactionTrace) => void;
  markNonceUsed: (nonce: string) => void;
  generateApiKey: (name: string) => ApiKey;
  revokeApiKey: (keyId: string) => void;
  addPendingApproval: (item: Omit<PendingApproval, "id" | "createdAt">) => PendingApproval;
  approvePendingRequest: (id: string) => void;
  denyPendingRequest: (id: string) => void;
  setActiveTraceId: (id: string | null) => void;
  resetSpend: () => void;
  clearHistory: () => void;
}

const DEFAULT_POLICY: PolicyLimits = {
  perRequestMax: 5.00,
  perProviderDailyMax: 10.00,
  dailyMax: 20.00,
  minQualityScore: 70,
  allowlist: [],
};

const INITIAL_API_KEYS: ApiKey[] = [
  {
    id: "key_sim_1",
    key: "sim_key_dev_default_99a1",
    name: "Default Developer Key",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    status: "active",
  },
  {
    id: "key_sim_2",
    key: "sim_key_agent_prod_33b2",
    name: "Autonomous Agent Key",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    status: "active",
  },
];

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider = ({ children }: { children: ReactNode }) => {
  const [policyLimits, setPolicyLimits] = useState<PolicyLimits>(DEFAULT_POLICY);
  const [spendToday, setSpendToday] = useState<SpendState>({
    today: 0.85, // small seed spend
    todayByProvider: {
      "p-llama3-sentiment": 0.35,
      "p-crypto-orderbook": 0.50,
    },
  });
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [traces, setTraces] = useState<TransactionTrace[]>([]);
  const [usedNonces, setUsedNonces] = useState<Set<string>>(new Set());
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(INITIAL_API_KEYS);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [activeTraceId, setActiveTraceId] = useState<string | null>(null);

  const updatePolicyLimits = (newLimits: Partial<PolicyLimits>) => {
    setPolicyLimits((prev) => ({ ...prev, ...newLimits }));
  };

  const addReceipt = (receipt: Receipt) => {
    setReceipts((prev) => [receipt, ...prev]);

    // Update spend state if successful
    if (receipt.status === "success") {
      setSpendToday((prev) => {
        const providerCurrent = prev.todayByProvider[receipt.providerId] || 0;
        return {
          today: parseFloat((prev.today + receipt.costActual).toFixed(4)),
          todayByProvider: {
            ...prev.todayByProvider,
            [receipt.providerId]: parseFloat((providerCurrent + receipt.costActual).toFixed(4)),
          },
        };
      });
      // Track used nonce for double-spend prevention
      markNonceUsed(receipt.requirement.nonce);
    }
  };

  const addTrace = (trace: TransactionTrace) => {
    setTraces((prev) => [trace, ...prev]);
    setActiveTraceId(trace.id);
  };

  const markNonceUsed = (nonce: string) => {
    setUsedNonces((prev) => new Set(prev).add(nonce));
  };

  const generateApiKey = (name: string): ApiKey => {
    const newKey: ApiKey = {
      id: generateId("key"),
      key: `sim_key_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString(36).substring(4)}`,
      name: name || "Simulated API Key",
      createdAt: new Date().toISOString(),
      status: "active",
    };
    setApiKeys((prev) => [newKey, ...prev]);
    return newKey;
  };

  const revokeApiKey = (keyId: string) => {
    setApiKeys((prev) =>
      prev.map((k) => (k.id === keyId ? { ...k, status: "revoked" as const } : k))
    );
  };

  const addPendingApproval = (item: Omit<PendingApproval, "id" | "createdAt">): PendingApproval => {
    const approval: PendingApproval = {
      ...item,
      id: generateId("appr"),
      createdAt: new Date().toISOString(),
    };
    setPendingApprovals((prev) => [approval, ...prev]);
    return approval;
  };

  const approvePendingRequest = (id: string) => {
    setPendingApprovals((prev) => prev.filter((a) => a.id !== id));
  };

  const denyPendingRequest = (id: string) => {
    setPendingApprovals((prev) => prev.filter((a) => a.id !== id));
  };

  const resetSpend = () => {
    setSpendToday({ today: 0, todayByProvider: {} });
  };

  const clearHistory = () => {
    setReceipts([]);
    setTraces([]);
    setUsedNonces(new Set());
    setPendingApprovals([]);
  };

  return (
    <PaymentContext.Provider
      value={{
        policyLimits,
        spendToday,
        receipts,
        traces,
        usedNonces,
        apiKeys,
        pendingApprovals,
        activeTraceId,
        updatePolicyLimits,
        addReceipt,
        addTrace,
        markNonceUsed,
        generateApiKey,
        revokeApiKey,
        addPendingApproval,
        approvePendingRequest,
        denyPendingRequest,
        setActiveTraceId,
        resetSpend,
        clearHistory,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};

export const usePaymentContext = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error("usePaymentContext must be used within a PaymentProvider");
  }
  return context;
};
