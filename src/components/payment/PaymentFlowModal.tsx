"use client";

import React, { useState } from "react";
import { Provider, Receipt, TransactionTrace } from "../../lib/x402/types";
import { usePaymentContext } from "../../context/PaymentContext";
import { useProviderContext } from "../../context/ProviderContext";
import { requestPaidResource } from "../../lib/x402/client";
import { PaymentRequirementCard } from "./PaymentRequirementCard";
import { ReceiptCard } from "./ReceiptCard";
import { TraceViewer } from "./TraceViewer";
import { formatCurrency } from "../../lib/utils";
import {
  X,
  Zap,
  Play,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  FileCode,
  Lock,
  ChevronDown,
  ChevronUp,
  Terminal,
  CheckCircle2,
  Sliders,
} from "lucide-react";

interface PaymentFlowModalProps {
  provider: Provider;
  onClose: () => void;
}

export const PaymentFlowModal: React.FC<PaymentFlowModalProps> = ({
  provider: initialProvider,
  onClose,
}) => {
  const { policyLimits, spendToday, usedNonces, addReceipt, addTrace, addPendingApproval } =
    usePaymentContext();
  const { providers: allProviders } = useProviderContext();

  const [currentProvider, setCurrentProvider] = useState<Provider>(initialProvider);
  const [requestInputText, setRequestInputText] = useState<string>(
    JSON.stringify({ prompt: "Analyze financial market sentiment for ETH/USD", sampleSize: 100 }, null, 2)
  );

  const [isExecuting, setIsExecuting] = useState(false);
  const [completedReceipt, setCompletedReceipt] = useState<Receipt | null>(null);
  const [executionResult, setExecutionResult] = useState<unknown | null>(null);
  const [currentTrace, setCurrentTrace] = useState<TransactionTrace | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fallbackProvider, setFallbackProvider] = useState<Provider | null>(null);

  // Tab & Collapse States
  const [showTraceView, setShowTraceView] = useState(false);
  const [showScenarioOptions, setShowScenarioOptions] = useState(false);

  // Scenario Presets
  const [selectedScenario, setSelectedScenario] = useState<string>("standard");

  const handleExecute = async () => {
    setIsExecuting(true);
    setErrorMessage(null);
    setCompletedReceipt(null);
    setExecutionResult(null);
    setFallbackProvider(null);

    let parsedInput: unknown = { prompt: "Default input" };
    try {
      parsedInput = JSON.parse(requestInputText);
    } catch (err) {
      parsedInput = { rawText: requestInputText };
    }

    // Determine failure flags from scenario selection
    const flags = {
      forceDisappear: selectedScenario === "disappear",
      forcePriceChange: selectedScenario === "price_change",
      forceMalformed402: selectedScenario === "malformed",
      forceReplayNonce: selectedScenario === "double_spend",
      forceSettlementFail: selectedScenario === "settlement_fail",
      allProviders,
    };

    try {
      const response = await requestPaidResource(
        currentProvider,
        parsedInput,
        policyLimits,
        spendToday,
        usedNonces,
        flags
      );

      if (response.trace) {
        setCurrentTrace(response.trace);
        addTrace(response.trace);
      }

      if ("error" in response && response.error) {
        setErrorMessage(response.error);
        if (response.requiresApproval) {
          addPendingApproval({
            providerId: currentProvider.id,
            providerName: currentProvider.name,
            estimatedCost: currentProvider.price,
            reason: response.error,
            requestInput: parsedInput,
          });
        }
        if (response.fallbackProvider) {
          setFallbackProvider(response.fallbackProvider);
        }
      } else if ("receipt" in response && response.receipt) {
        setCompletedReceipt(response.receipt);
        if ("result" in response) {
          setExecutionResult(response.result);
        }
        addReceipt(response.receipt);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred during execution.");
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSwitchToFallback = (fallback: Provider) => {
    setCurrentProvider(fallback);
    setErrorMessage(null);
    setFallbackProvider(null);
    setCompletedReceipt(null);
    setSelectedScenario("standard");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl text-slate-100 my-6 transition-all">
        {/* Sleek Top Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-cyan-500/10 p-2 rounded-xl border border-cyan-500/20 text-cyan-400">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base text-white">{currentProvider.name}</h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                    currentProvider.paymentType === "upto"
                      ? "bg-purple-500/15 text-purple-300 border border-purple-500/30"
                      : "bg-blue-500/15 text-blue-300 border border-blue-500/30"
                  }`}
                >
                  {currentProvider.paymentType === "upto" ? "UPTO (Metered)" : "EXACT (Fixed)"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                {formatCurrency(currentProvider.price)} USD • {currentProvider.network}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Notice for Prompt Injection Test Provider */}
        {currentProvider.isInjectablePrompt && (
          <div className="bg-purple-950/40 border-b border-purple-800/40 px-6 py-2.5 text-xs text-purple-300 flex items-center space-x-2 font-mono">
            <Lock className="w-4 h-4 text-purple-400 shrink-0" />
            <span>
              <strong>Security Test Mode:</strong> Evaluated strictly on structured fields. Description text is ignored.
            </span>
          </div>
        )}

        <div className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {/* Preset Execution Mode Bar */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>Execution Mode</span>
              </span>

              <button
                onClick={() => setShowScenarioOptions(!showScenarioOptions)}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium flex items-center space-x-1"
              >
                <span>{showScenarioOptions ? "Hide Presets" : "Test Failure Scenarios"}</span>
                {showScenarioOptions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {showScenarioOptions ? (
              <select
                value={selectedScenario}
                onChange={(e) => setSelectedScenario(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
              >
                <option value="standard">Standard x402 Payment Flow (Success)</option>
                <option value="disappear">Adversarial: Provider Disappears After 402 (Fallback)</option>
                <option value="price_change">Adversarial: Price Changes Mid-Flow (Mismatch)</option>
                <option value="malformed">Adversarial: Malformed 402 Requirement (Corrupt)</option>
                <option value="double_spend">Adversarial: Replay Used Nonce (Double Spend)</option>
              </select>
            ) : (
              <p className="text-[11px] text-slate-400">
                {selectedScenario === "standard"
                  ? "Standard flow: Request resource → receive 402 requirement → sign payload → settle → receipt."
                  : `Active scenario: ${selectedScenario}`}
              </p>
            )}
          </div>

          {/* Action Trigger / Execution Input */}
          {!completedReceipt && !errorMessage && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Request Input Payload
                </label>
                <textarea
                  rows={2}
                  value={requestInputText}
                  onChange={(e) => setRequestInputText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-cyan-300 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <button
                onClick={handleExecute}
                disabled={isExecuting}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center space-x-2"
              >
                {isExecuting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing x402 Lifecycle...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Pay {formatCurrency(currentProvider.price)} & Execute API</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Error / Aborted Result Banner */}
          {errorMessage && (
            <div className="bg-rose-950/30 border border-rose-500/40 rounded-xl p-5 space-y-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-rose-200 text-sm">Payment Flow Aborted</h4>
                  <p className="text-xs text-rose-300 mt-1 leading-relaxed">{errorMessage}</p>
                </div>
              </div>

              {/* Automated Fallback Recommendation */}
              {fallbackProvider && (
                <div className="bg-slate-950 p-4 rounded-xl border border-cyan-500/40 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold block">
                      Recommended Fallback Node
                    </span>
                    <h5 className="font-bold text-white text-sm mt-0.5">{fallbackProvider.name}</h5>
                    <p className="text-slate-400">
                      ${fallbackProvider.price} • {fallbackProvider.qualityScore}% Quality
                    </p>
                  </div>

                  <button
                    onClick={() => handleSwitchToFallback(fallbackProvider)}
                    className="px-3.5 py-2 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center space-x-1 transition-colors shrink-0"
                  >
                    <span>Use Fallback</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-1">
                <button
                  onClick={() => {
                    setErrorMessage(null);
                    setSelectedScenario("standard");
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Success State: Clean Receipt Card */}
          {completedReceipt && (
            <div className="space-y-4">
              <ReceiptCard receipt={completedReceipt} />

              {executionResult !== null && (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400">
                    <FileCode className="w-4 h-4" />
                    <span>API Execution Output</span>
                  </div>
                  <pre className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto">
                    {JSON.stringify(executionResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Collapsible Protocol Trace Inspector */}
          {currentTrace && (
            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowTraceView(!showTraceView)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-slate-300 text-xs font-semibold flex items-center justify-between transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span>Inspect x402 Protocol Trace ({currentTrace.steps.length} steps)</span>
                </div>
                {showTraceView ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showTraceView && (
                <div className="mt-3">
                  <TraceViewer trace={currentTrace} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
