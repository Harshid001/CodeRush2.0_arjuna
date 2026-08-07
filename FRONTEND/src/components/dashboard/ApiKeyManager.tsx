"use client";

import React, { useState } from "react";
import { usePaymentContext } from "../../context/PaymentContext";
import { maskKeyId } from "../../lib/utils";
import { Key, Plus, Trash2, Copy, Check, Shield } from "lucide-react";

export const ApiKeyManager: React.FC = () => {
  const { apiKeys, generateApiKey, revokeApiKey } = usePaymentContext();
  const [keyNameInput, setKeyNameInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyNameInput.trim()) return;
    generateApiKey(keyNameInput.trim());
    setKeyNameInput("");
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl text-slate-100 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-cyan-500/20 p-2.5 rounded-xl border border-cyan-500/30 text-cyan-400">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Simulated API Keys</h3>
            <p className="text-xs text-slate-400">
              Manage developer signing keys used in client payment payloads
            </p>
          </div>
        </div>
      </div>

      {/* Generate Key Form */}
      <form onSubmit={handleCreate} className="flex gap-3">
        <input
          type="text"
          placeholder="Key Label (e.g., Staging Agent Key)"
          value={keyNameInput}
          onChange={(e) => setKeyNameInput(e.target.value)}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none font-mono"
        />
        <button
          type="submit"
          disabled={!keyNameInput.trim()}
          className="px-4 py-2.5 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Key</span>
        </button>
      </form>

      {/* Security Banner */}
      <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-400 flex items-center space-x-2 font-mono">
        <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>
          Simulated credentials only (`sim_` prefix). No real private key material or wallet seed phrases exist.
        </span>
      </div>

      {/* Keys List */}
      <div className="space-y-2">
        {apiKeys.map((k) => (
          <div
            key={k.id}
            className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-4 text-xs"
          >
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white text-sm">{k.name}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                    k.status === "active"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {k.status}
                </span>
              </div>
              <span className="font-mono text-cyan-300 block mt-1">{maskKeyId(k.key)}</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleCopy(k.id, k.key)}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors"
                title="Copy Key string"
              >
                {copiedId === k.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>

              {k.status === "active" && (
                <button
                  onClick={() => revokeApiKey(k.id)}
                  className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                  title="Revoke Key"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
