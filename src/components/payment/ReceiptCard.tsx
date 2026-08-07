"use client";

import React from "react";
import { Receipt } from "../../lib/x402/types";
import { formatCurrency, maskSignature } from "../../lib/utils";
import { CheckCircle2, XCircle, FileText, ArrowRight, ShieldCheck, Zap, ExternalLink } from "lucide-react";
import Link from "next/link";
import { usePaymentContext } from "../../context/PaymentContext";

interface ReceiptCardProps {
  receipt: Receipt;
  onViewTrace?: () => void;
}

export const ReceiptCard: React.FC<ReceiptCardProps> = ({ receipt, onViewTrace }) => {
  const { setActiveTraceId } = usePaymentContext();
  const isSuccess = receipt.status === "success";

  const handleTraceClick = () => {
    if (receipt.id) {
      // Find trace or set active trace
      setActiveTraceId(receipt.id);
    }
    if (onViewTrace) onViewTrace();
  };

  return (
    <div
      className={`rounded-xl p-5 border shadow-xl backdrop-blur-md transition-all ${
        isSuccess
          ? "bg-slate-900/95 border-emerald-500/40 text-slate-100"
          : "bg-slate-900/95 border-rose-500/40 text-slate-100"
      }`}
    >
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
        <div className="flex items-center space-x-3">
          <div
            className={`p-2 rounded-xl border ${
              isSuccess
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                : "bg-rose-500/20 text-rose-400 border-rose-500/30"
            }`}
          >
            {isSuccess ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-bold text-lg text-white">x402 Payment Receipt</h4>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  isSuccess
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                }`}
              >
                {receipt.status.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">Receipt ID: {receipt.id}</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 block">Total Charged</span>
          <span className="font-mono text-emerald-400 font-extrabold text-xl">
            {formatCurrency(receipt.costActual)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-xs">
        <div className="space-y-2 bg-slate-950/70 p-3 rounded-lg border border-slate-800">
          <div className="flex justify-between">
            <span className="text-slate-400">Provider:</span>
            <span className="font-semibold text-slate-200">{receipt.providerName || receipt.providerId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Scheme:</span>
            <span className="font-mono uppercase text-cyan-300">{receipt.requirement.scheme}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Requirement Cap:</span>
            <span className="font-mono text-slate-300">{formatCurrency(receipt.requirement.amount)}</span>
          </div>
          {receipt.requirement.scheme === "upto" && (
            <div className="flex justify-between text-purple-300">
              <span>Metered Savings:</span>
              <span>
                {formatCurrency(receipt.requirement.amount - receipt.costActual)} (Saved vs Cap)
              </span>
            </div>
          )}
        </div>

        <div className="space-y-2 bg-slate-950/70 p-3 rounded-lg border border-slate-800">
          <div className="flex justify-between">
            <span className="text-slate-400">Settlement ID:</span>
            <span className="font-mono text-amber-300 text-[11px] truncate max-w-[150px]">
              {receipt.settlement.settlementId}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Latency:</span>
            <span className="font-mono text-emerald-400">{receipt.latencyMs}ms</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Settled At:</span>
            <span className="font-mono text-slate-300">
              {new Date(receipt.settlement.settledAt).toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      {/* Hashes section */}
      <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800/80 mb-4 font-mono text-[11px]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-slate-400">Input Payload Hash:</span>
          <span className="text-slate-300">{receipt.inputHash}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Output Result Hash:</span>
          <span className="text-slate-300">{receipt.outputHash}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
        <div className="flex items-center text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" />
          <span>Verified & Settled by Simulated Facilitator</span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(receipt, null, 2));
              const downloadAnchor = document.createElement('a');
              downloadAnchor.setAttribute("href", dataStr);
              downloadAnchor.setAttribute("download", `receipt-${receipt.id}.json`);
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            }}
            className="inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
            <span>Download JSON</span>
          </button>

          <Link
            href="/dashboard"
            onClick={handleTraceClick}
            className="inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-colors"
          >
            <span>Return To Dashboard</span>
            <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
