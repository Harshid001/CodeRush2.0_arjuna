"use client";

import React from "react";
import { usePaymentContext } from "../../context/PaymentContext";
import { formatCurrency } from "../../lib/utils";
import { History, Eye, CheckCircle2, XCircle, Clock } from "lucide-react";

interface UsageHistoryProps {
  onSelectTrace?: (traceId: string) => void;
}

export const UsageHistory: React.FC<UsageHistoryProps> = ({ onSelectTrace }) => {
  const { receipts, traces, setActiveTraceId, clearHistory } = usePaymentContext();

  const handleTraceClick = (receiptId: string) => {
    // Find matching trace
    const matchedTrace = traces.find((t) => t.receiptId === receiptId || t.id.includes(receiptId));
    const targetId = matchedTrace ? matchedTrace.id : traces[0]?.id;
    if (targetId) {
      setActiveTraceId(targetId);
      if (onSelectTrace) onSelectTrace(targetId);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl text-slate-100 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-500/20 p-2.5 rounded-xl border border-emerald-500/30 text-emerald-400">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">x402 Transaction History & Audit Receipts</h3>
            <p className="text-xs text-slate-400">
              Complete record of all verified payment receipts and settlement transactions
            </p>
          </div>
        </div>

        {receipts.length > 0 && (
          <button
            onClick={clearHistory}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors"
          >
            Clear History
          </button>
        )}
      </div>

      {receipts.length === 0 ? (
        <div className="bg-slate-950 p-12 text-center rounded-xl border border-slate-800 space-y-3">
          <Clock className="w-10 h-10 text-slate-600 mx-auto" />
          <h4 className="font-bold text-slate-300 text-sm">No Payments Recorded Yet</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Test an API endpoint on the Marketplace or run a demo scenario to generate x402 payment receipts.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Receipt ID</th>
                <th className="py-3 px-4">Provider</th>
                <th className="py-3 px-4">Scheme</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Latency</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {receipts.map((rcpt) => (
                <tr key={rcpt.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-bold text-cyan-300">{rcpt.id}</td>
                  <td className="py-3 px-4 text-white font-sans font-medium">
                    {rcpt.providerName || rcpt.providerId}
                  </td>
                  <td className="py-3 px-4 uppercase text-slate-300">{rcpt.requirement.scheme}</td>
                  <td className="py-3 px-4 text-emerald-400 font-bold">
                    {formatCurrency(rcpt.costActual)}
                  </td>
                  <td className="py-3 px-4 text-slate-400">{rcpt.latencyMs}ms</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        rcpt.status === "success"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      }`}
                    >
                      {rcpt.status === "success" ? (
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                      ) : (
                        <XCircle className="w-3 h-3 mr-1" />
                      )}
                      {rcpt.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleTraceClick(rcpt.id)}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 font-sans font-semibold flex items-center space-x-1 ml-auto transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Trace</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
