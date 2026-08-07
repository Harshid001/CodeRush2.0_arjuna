"use client";

import React, { useState } from "react";
import { TransactionTrace, TraceStep } from "../../lib/x402/types";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  ChevronDown,
  ChevronRight,
  Shield,
  Clock,
  Terminal,
  Code,
} from "lucide-react";

interface TraceViewerProps {
  trace: TransactionTrace;
}

export const TraceViewer: React.FC<TraceViewerProps> = ({ trace }) => {
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});
  const [showRawJson, setShowRawJson] = useState(false);

  const toggleStep = (stepId: string) => {
    setExpandedSteps((prev) => ({ ...prev, [stepId]: !prev[stepId] }));
  };

  const getStatusIcon = (status: TraceStep["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
      case "error":
        return <XCircle className="w-4 h-4 text-rose-400 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-cyan-400 shrink-0" />;
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl text-slate-100">
      {/* Sleek Minimal Header */}
      <div className="p-3.5 border-b border-slate-800/80 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-white">Exchange Trace</span>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
              trace.status === "completed" || trace.status === "success"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                : trace.status === "blocked"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
            }`}
          >
            {trace.status}
          </span>
        </div>

        <button
          onClick={() => setShowRawJson(!showRawJson)}
          className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors flex items-center space-x-1"
        >
          <Code className="w-3 h-3" />
          <span>{showRawJson ? "Visual View" : "Raw JSON"}</span>
        </button>
      </div>

      {/* Security Note */}
      <div className="bg-slate-900/60 border-b border-slate-800 px-3.5 py-1.5 flex items-center space-x-1.5 text-[11px] text-slate-400 font-mono">
        <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span>Simulated signature — no real key material exposed.</span>
      </div>

      {/* Trace Items */}
      {showRawJson ? (
        <div className="p-3 max-h-[400px] overflow-auto font-mono text-[11px] text-cyan-300">
          <pre>{JSON.stringify(trace, null, 2)}</pre>
        </div>
      ) : (
        <div className="p-3 space-y-2 max-h-[450px] overflow-y-auto">
          {trace.steps.map((step, idx) => {
            const isExpanded = !!expandedSteps[step.id];

            return (
              <div
                key={step.id}
                className="bg-slate-900/80 border border-slate-800/80 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleStep(step.id)}
                  className="w-full p-2.5 text-left flex items-center justify-between hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    {getStatusIcon(step.status)}
                    <span className="font-semibold text-xs text-white truncate">
                      {idx + 1}. {step.title}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono shrink-0">
                    <span>{step.durationMs}ms</span>
                    {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-3 pb-3 pt-1 border-t border-slate-800/60 text-xs space-y-2">
                    <p className="text-slate-300 text-[11px] leading-relaxed">{step.description}</p>
                    <pre className="p-2 bg-slate-950 rounded border border-slate-800 text-[10px] font-mono text-slate-300 overflow-x-auto">
                      {JSON.stringify(step.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
