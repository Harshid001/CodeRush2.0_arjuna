"use client";

import React from "react";
import { PaymentRequirement } from "../../lib/x402/types";
import { formatCurrency, maskKeyId } from "../../lib/utils";
import { AlertCircle, Clock, ShieldCheck, Zap, Lock } from "lucide-react";

interface PaymentRequirementCardProps {
  requirement: PaymentRequirement;
  providerName?: string;
}

export const PaymentRequirementCard: React.FC<PaymentRequirementCardProps> = ({
  requirement,
  providerName,
}) => {
  const expiresDate = new Date(requirement.expiresAt);
  const formattedExpiry = expiresDate.toLocaleTimeString();

  return (
    <div className="bg-slate-900/90 border border-amber-500/40 rounded-xl p-5 shadow-lg backdrop-blur-md text-slate-100">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center space-x-2">
          <div className="bg-amber-500/20 p-2 rounded-lg border border-amber-500/30 text-amber-400 font-mono font-bold text-sm">
            HTTP 402
          </div>
          <div>
            <h4 className="font-semibold text-white text-base">Payment Required</h4>
            <p className="text-xs text-slate-400">x402 Protocol Specification V1.0</p>
          </div>
        </div>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30">
          <Clock className="w-3 h-3 mr-1" /> Valid until {formattedExpiry}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-xs">
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
          <span className="text-slate-400 block mb-1">Provider ID / Name</span>
          <span className="font-mono text-slate-200 font-medium text-sm">
            {providerName || requirement.providerId}
          </span>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
          <span className="text-slate-400 block mb-1">Payment Scheme & Amount</span>
          <div className="flex items-center justify-between">
            <span className="font-mono text-emerald-400 text-base font-bold">
              {formatCurrency(requirement.amount, requirement.currency)}
            </span>
            <span
              className={`px-2 py-0.5 rounded uppercase font-bold text-[10px] tracking-wider ${
                requirement.scheme === "upto"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
              }`}
            >
              {requirement.scheme === "upto" ? "UPTO (Metered Cap)" : "EXACT (Fixed)"}
            </span>
          </div>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
          <span className="text-slate-400 block mb-1">Recipient Identifier</span>
          <span className="font-mono text-amber-300 text-xs truncate block" title={requirement.payToAddress}>
            {requirement.payToAddress}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Simulated recipient identifier</span>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
          <span className="text-slate-400 block mb-1">Network & Nonce</span>
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-cyan-400">{requirement.network}</span>
            <span className="text-slate-400">{maskKeyId(requirement.nonce)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 text-[11px] text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>
          Client will construct a capped payment payload referencing nonce{" "}
          <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded">{requirement.nonce.slice(-6)}</code>.
        </span>
      </div>
    </div>
  );
};
