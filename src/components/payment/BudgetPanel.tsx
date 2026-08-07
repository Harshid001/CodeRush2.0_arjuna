"use client";

import React, { useState } from "react";
import { usePaymentContext } from "../../context/PaymentContext";
import { formatCurrency } from "../../lib/utils";
import {
  Wallet,
  ShieldAlert,
  CheckCircle,
  XCircle,
  Settings,
  SlidersHorizontal,
  Clock,
  Zap,
} from "lucide-react";

export const BudgetPanel: React.FC = () => {
  const {
    policyLimits,
    spendToday,
    pendingApprovals,
    updatePolicyLimits,
    approvePendingRequest,
    denyPendingRequest,
    resetSpend,
  } = usePaymentContext();

  const [isEditing, setIsEditing] = useState(false);
  const [perRequestMax, setPerRequestMax] = useState(policyLimits.perRequestMax);
  const [perProviderDailyMax, setPerProviderDailyMax] = useState(policyLimits.perProviderDailyMax);
  const [dailyMax, setDailyMax] = useState(policyLimits.dailyMax);
  const [minQualityScore, setMinQualityScore] = useState(policyLimits.minQualityScore);
  const [allowlistInput, setAllowlistInput] = useState(
    (policyLimits.allowlist || []).join(", ")
  );

  const spendPercent = Math.min(100, (spendToday.today / policyLimits.dailyMax) * 100);

  const handleSavePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    const allowlist = allowlistInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    updatePolicyLimits({
      perRequestMax: Number(perRequestMax),
      perProviderDailyMax: Number(perProviderDailyMax),
      dailyMax: Number(dailyMax),
      minQualityScore: Number(minQualityScore),
      allowlist: allowlist.length > 0 ? allowlist : undefined,
    });
    setIsEditing(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl text-slate-100 space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-cyan-500/20 p-2.5 rounded-xl border border-cyan-500/30 text-cyan-400">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Agent Budget & Governance Policy</h3>
            <p className="text-xs text-slate-400">
              Autonomous agent spending guardrails and soft-limit escalation manager
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 transition-colors flex items-center space-x-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{isEditing ? "Close Editor" : "Edit Policy Limits"}</span>
          </button>

          <button
            onClick={resetSpend}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
          >
            Reset Daily Counter
          </button>
        </div>
      </div>

      {/* Progress Bar & Current Spend Overview */}
      <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
        <div className="flex justify-between items-end">
          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">
              Today's Total Spend
            </span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-3xl font-extrabold text-white font-mono">
                {formatCurrency(spendToday.today)}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                / {formatCurrency(policyLimits.dailyMax)} Max
              </span>
            </div>
          </div>

          <div className="text-right">
            <span
              className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold font-mono ${
                spendPercent >= 90
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  : spendPercent >= 75
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              }`}
            >
              {spendPercent.toFixed(1)}% Used
            </span>
          </div>
        </div>

        {/* Progress bar container */}
        <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700/50">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              spendPercent >= 90
                ? "bg-gradient-to-r from-amber-500 to-rose-500"
                : spendPercent >= 75
                ? "bg-gradient-to-r from-cyan-500 to-amber-500"
                : "bg-gradient-to-r from-emerald-500 to-cyan-500"
            }`}
            style={{ width: `${spendPercent}%` }}
          />
        </div>
      </div>

      {/* Policy Edit Form */}
      {isEditing && (
        <form
          onSubmit={handleSavePolicy}
          className="bg-slate-950 p-5 rounded-xl border border-cyan-500/40 space-y-4"
        >
          <h4 className="font-bold text-sm text-cyan-300 flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Configure Policy Rules</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Per-Request Max ($)</label>
              <input
                type="number"
                step="0.10"
                value={perRequestMax}
                onChange={(e) => setPerRequestMax(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Per-Provider Daily Max ($)</label>
              <input
                type="number"
                step="0.50"
                value={perProviderDailyMax}
                onChange={(e) => setPerProviderDailyMax(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Overall Daily Max ($)</label>
              <input
                type="number"
                step="1.00"
                value={dailyMax}
                onChange={(e) => setDailyMax(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Min Quality Score (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={minQualityScore}
                onChange={(e) => setMinQualityScore(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 text-xs">
              Provider Allowlist (comma separated IDs, leave empty to allow all eligible providers)
            </label>
            <input
              type="text"
              placeholder="e.g. p-llama3-sentiment, p-crypto-orderbook"
              value={allowlistInput}
              onChange={(e) => setAllowlistInput(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors"
            >
              Save Policy Updates
            </button>
          </div>
        </form>
      )}

      {/* Active Rules Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
          <span className="text-slate-400 block mb-1">Per-Request Limit</span>
          <span className="font-mono text-white text-base font-bold">
            {formatCurrency(policyLimits.perRequestMax)}
          </span>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
          <span className="text-slate-400 block mb-1">Per-Provider Daily Max</span>
          <span className="font-mono text-white text-base font-bold">
            {formatCurrency(policyLimits.perProviderDailyMax)}
          </span>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
          <span className="text-slate-400 block mb-1">Min Provider Quality</span>
          <span className="font-mono text-cyan-300 text-base font-bold">
            {policyLimits.minQualityScore}%
          </span>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
          <span className="text-slate-400 block mb-1">Allowlist Restrictions</span>
          <span className="font-mono text-amber-300 text-xs truncate block">
            {policyLimits.allowlist && policyLimits.allowlist.length > 0
              ? `${policyLimits.allowlist.length} Enforced`
              : "Unrestricted (All)"}
          </span>
        </div>
      </div>

      {/* Pending Approvals Section (Soft Limit Escalation UI) */}
      {pendingApprovals.length > 0 && (
        <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-4 space-y-3">
          <div className="flex items-center space-x-2 text-amber-300">
            <ShieldAlert className="w-5 h-5 text-amber-400 animate-pulse" />
            <h4 className="font-bold text-sm">Pending Manual Approvals (Soft Threshold Reached)</h4>
          </div>

          <div className="space-y-2">
            {pendingApprovals.map((appr) => (
              <div
                key={appr.id}
                className="bg-slate-950 p-3.5 rounded-lg border border-amber-500/30 flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white">{appr.providerName}</span>
                    <span className="font-mono text-amber-400 font-bold">
                      {formatCurrency(appr.estimatedCost)}
                    </span>
                  </div>
                  <p className="text-slate-400 mt-0.5">{appr.reason}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => approvePendingRequest(appr.id)}
                    className="px-3 py-1.5 rounded-lg font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center space-x-1 transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => denyPendingRequest(appr.id)}
                    className="px-3 py-1.5 rounded-lg font-bold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 flex items-center space-x-1 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Deny</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
