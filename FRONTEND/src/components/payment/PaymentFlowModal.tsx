"use client";

import React, { useState, useEffect } from "react";
import { Provider, Receipt, TransactionTrace } from "../../lib/x402/types";
import { usePaymentContext } from "../../context/PaymentContext";
import { useProviderContext } from "../../context/ProviderContext";
import { requestPaidResource } from "../../lib/x402/client";
import { formatCurrency } from "../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount } from "wagmi";
import {
  X,
  Zap,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  FileCode,
  Lock,
  CheckCircle2,
  Sliders,
  Wallet,
  Globe,
  Star,
  Clock,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Terminal,
} from "lucide-react";

interface PaymentFlowModalProps {
  provider: Provider;
  onClose: () => void;
}

type CheckoutStep = "review" | "confirm" | "processing" | "success" | "failure";

export const PaymentFlowModal: React.FC<PaymentFlowModalProps> = ({
  provider: initialProvider,
  onClose,
}) => {
  const { policyLimits, spendToday, usedNonces, addReceipt, addTrace, addPendingApproval } =
    usePaymentContext();
  const { providers: allProviders } = useProviderContext();
  const { address: connectedAddress, isConnected } = useAccount();

  const [currentProvider, setCurrentProvider] = useState<Provider>(initialProvider);
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>("review");

  const [isExecuting, setIsExecuting] = useState(false);
  const [completedReceipt, setCompletedReceipt] = useState<Receipt | null>(null);
  const [executionResult, setExecutionResult] = useState<unknown | null>(null);
  const [currentTrace, setCurrentTrace] = useState<TransactionTrace | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fallbackProvider, setFallbackProvider] = useState<Provider | null>(null);

  // Tab & Collapse States
  const [showTraceView, setShowTraceView] = useState(false);

  // Animated Payment Steps
  const PAYMENT_STEPS = [
    "Preparing Purchase Session",
    "Reading x402 Requirements",
    "Waiting for Wallet Confirmation",
    "Transaction Signing",
    "Verifying Transaction Payload",
    "Retrying Request with Authorization",
    "Executing Provider API Node",
    "Generating Immutable Receipt",
  ];

  const [paymentStepIndex, setPaymentStepIndex] = useState<number>(0);

  const displayAddress = connectedAddress || "0x71C83B47c04E923a10F8721102910a9E23";
  const displayGas = 0.0003; // Mocked gas fee in ETH
  const totalCost = currentProvider.price + (displayGas * 3500); // estimate total USD cost

  const handleConfirmAndSign = async () => {
    setCheckoutStep("processing");
    setIsExecuting(true);
    setErrorMessage(null);
    setCompletedReceipt(null);
    setExecutionResult(null);
    setFallbackProvider(null);
    setPaymentStepIndex(0);

    // Pre-configured default task payload depending on provider category
    const defaultPayloads: Record<string, unknown> = {
      "p-llama3-sentiment": { prompt: "Analyze financial market sentiment for ETH/USD", sampleSize: 100 },
      "p-vision-inspector": { imageUrl: "https://example.com/invoice.png", task: "ocr_extraction" },
      "p-crypto-orderbook": { pair: "ETH/USDT", depth: 20 },
      "p-deepcoder-gen": { codeContext: "function calculateTax() {}", language: "typescript" },
    };
    const parsedInput = defaultPayloads[currentProvider.id] || { prompt: `Inference request for ${currentProvider.name}` };

    // Standard success scenario driven automatically
    const flags = {
      forceDisappear: false,
      forcePriceChange: false,
      forceMalformed402: false,
      forceReplayNonce: false,
      forceSettlementFail: false,
      allProviders,
    };

    // Step animation timer simulation
    const stepInterval = setInterval(() => {
      setPaymentStepIndex((prev) => (prev < PAYMENT_STEPS.length - 1 ? prev + 1 : prev));
    }, 400);

    try {
      const response = await requestPaidResource(
        currentProvider,
        parsedInput,
        policyLimits,
        spendToday,
        usedNonces,
        flags
      );

      clearInterval(stepInterval);

      if (response.trace) {
        setCurrentTrace(response.trace);
        addTrace(response.trace);
      }

      if ("error" in response && response.error) {
        setErrorMessage(response.error);
        setCheckoutStep("failure");
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
        setCheckoutStep("success");
      }
    } catch (err: any) {
      clearInterval(stepInterval);
      setErrorMessage(err.message || "An unexpected error occurred during execution.");
      setCheckoutStep("failure");
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSwitchToFallback = (fallback: Provider) => {
    setCurrentProvider(fallback);
    setErrorMessage(null);
    setFallbackProvider(null);
    setCompletedReceipt(null);
    setCheckoutStep("review");
  };

  const downloadReceiptJson = () => {
    if (!completedReceipt) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(completedReceipt, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `receipt-${completedReceipt.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl text-slate-100 my-6 transition-all backdrop-blur-xl">
        
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-850 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">x402 Checkout</h3>
              <p className="text-[10px] text-slate-400 font-mono">Protocol Payment Handler</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: PURCHASE REVIEW */}
            {checkoutStep === "review" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-5"
              >
                {/* Header title */}
                <div className="text-center space-y-1">
                  <h2 className="text-xl font-bold tracking-tight text-white">Review Purchase</h2>
                  <p className="text-xs text-slate-400">Authorize secure execution for this API node</p>
                </div>

                {/* Provider Card */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[9px] font-mono font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                        {currentProvider.category}
                      </span>
                      <h3 className="font-bold text-white text-base mt-1.5">{currentProvider.name}</h3>
                      <p className="text-xs text-slate-400 mt-1">{currentProvider.description}</p>
                    </div>
                  </div>

                  {/* Provider Key Specs Grid */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-850 text-center">
                    <div className="bg-slate-900/60 p-2 rounded-xl">
                      <span className="text-[9px] text-slate-500 font-mono block">QUALITY</span>
                      <span className="text-xs font-bold text-slate-200">{currentProvider.qualityScore}%</span>
                    </div>
                    <div className="bg-slate-900/60 p-2 rounded-xl">
                      <span className="text-[9px] text-slate-500 font-mono block">SCHEME</span>
                      <span className="text-xs font-bold text-slate-200 font-mono uppercase">{currentProvider.paymentType}</span>
                    </div>
                    <div className="bg-slate-900/60 p-2 rounded-xl">
                      <span className="text-[9px] text-slate-500 font-mono block">NETWORK</span>
                      <span className="text-xs font-bold text-slate-200 font-mono truncate block">{currentProvider.network}</span>
                    </div>
                  </div>
                </div>

                {/* Wallet Connect details */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 flex items-center space-x-1.5">
                      <Wallet className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Authorized Wallet</span>
                    </span>
                    <span className="font-mono text-slate-200">{displayAddress.slice(0, 6)}...{displayAddress.slice(-4)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 flex items-center space-x-1.5">
                      <Globe className="w-3.5 h-3.5 text-blue-400" />
                      <span>Settlement Network</span>
                    </span>
                    <span className="font-mono text-slate-200 capitalize">{currentProvider.network}</span>
                  </div>
                </div>

                {/* Pricing summary details */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">API Unit Cost ({currentProvider.paymentType === "exact" ? "Fixed" : "Cap"})</span>
                    <span className="font-semibold text-slate-200">{formatCurrency(currentProvider.price)} USD</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Estimated Gas Fee</span>
                    <span className="font-mono text-slate-400">~{displayGas} ETH (${(displayGas * 3500).toFixed(2)})</span>
                  </div>
                  <div className="border-t border-slate-850 pt-2.5 flex justify-between items-center text-sm font-bold">
                    <span className="text-slate-300">Estimated Total Cost</span>
                    <span className="text-emerald-400 text-base">${totalCost.toFixed(4)} USD</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 px-4 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setCheckoutStep("confirm")}
                    className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 transition-all flex items-center justify-center space-x-2"
                  >
                    <span>Proceed to Confirm</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: CONFIRMATION CARD */}
            {checkoutStep === "confirm" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6 text-center py-4"
              >
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/10">
                    <Wallet className="w-7 h-7" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl font-extrabold text-white">Confirm Purchase</h2>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                    You are about to authorize secure payment and execute this API request using x402.
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 max-w-sm mx-auto space-y-3 text-left">
                  <div className="flex justify-between text-xs border-b border-slate-850 pb-2">
                    <span className="text-slate-500">Total Cost Target:</span>
                    <span className="font-bold text-emerald-400 text-sm">${totalCost.toFixed(4)} USD</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Settlement Network:</span>
                    <span className="font-mono text-slate-300">{currentProvider.network}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Signing Account:</span>
                    <span className="font-mono text-slate-300">{displayAddress.slice(0, 6)}...{displayAddress.slice(-4)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Billing Type:</span>
                    <span className="font-semibold text-slate-300 uppercase">{currentProvider.paymentType} Payment</span>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4 max-w-sm mx-auto">
                  <button
                    onClick={() => setCheckoutStep("review")}
                    className="flex-1 py-3 px-4 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-350 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmAndSign}
                    className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all"
                  >
                    Confirm Payment
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: PROCESSING */}
            {checkoutStep === "processing" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="flex flex-col items-center justify-center space-y-4 py-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-cyan-500/10 border-t-cyan-500 animate-spin" />
                    <Zap className="w-6 h-6 text-cyan-400 absolute top-5 left-5 animate-pulse" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-base text-white">Executing Payment Protocol</h3>
                    <p className="text-xs text-slate-400 font-mono mt-1">Please confirm or sign in your wallet extension</p>
                  </div>
                </div>

                {/* Animated Steps Timeline */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 space-y-3">
                  {PAYMENT_STEPS.map((stepLabel, idx) => {
                    const isPassed = idx < paymentStepIndex;
                    const isActive = idx === paymentStepIndex;

                    return (
                      <div key={idx} className="flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center space-x-2">
                          {isPassed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : isActive ? (
                            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping shrink-0 ml-1 mr-1" />
                          ) : (
                            <span className="w-1.5 h-1.5 bg-slate-800 rounded-full shrink-0 ml-1 mr-1" />
                          )}
                          <span
                            className={
                              isActive
                                ? "text-cyan-300 font-bold"
                                : isPassed
                                ? "text-slate-450 line-through opacity-60"
                                : "text-slate-650"
                            }
                          >
                            {stepLabel}
                          </span>
                        </div>

                        {isPassed && <span className="text-[10px] text-emerald-500">Done</span>}
                        {isActive && <span className="text-[10px] text-cyan-400 animate-pulse">Running</span>}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 4: SUCCESS VIEW */}
            {checkoutStep === "success" && completedReceipt && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                {/* Success Indicator */}
                <div className="text-center space-y-2 py-2">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/15">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                  </div>
                  <h2 className="text-xl font-extrabold text-white">Payment Successful</h2>
                  <p className="text-xs text-slate-450">Provider node executed & receipt issued</p>
                </div>

                {/* Details Summary Card */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-3 text-xs">
                  <div className="flex justify-between border-b border-slate-850 pb-2">
                    <span className="text-slate-500">Receipt ID:</span>
                    <span className="font-mono text-slate-200">{completedReceipt.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Provider Node:</span>
                    <span className="font-semibold text-slate-300">{completedReceipt.providerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Amount Paid:</span>
                    <span className="font-mono text-emerald-400 font-bold">{formatCurrency(completedReceipt.costActual)} USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">TX Settlement Hash:</span>
                    <span className="font-mono text-slate-400 truncate max-w-[180px]">{completedReceipt.settlement.settlementId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Settlement Status:</span>
                    <span className="text-emerald-400 font-semibold uppercase font-mono">Settled</span>
                  </div>
                </div>

                {/* API Execution Output */}
                {executionResult !== null && (
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-2">
                    <div className="flex items-center space-x-2 text-[11px] font-bold text-cyan-400 font-mono">
                      <FileCode className="w-3.5 h-3.5" />
                      <span>Execution Output Payload</span>
                    </div>
                    <pre className="p-3 bg-slate-900 rounded-xl border border-slate-850 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-[140px]">
                      {JSON.stringify(executionResult, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={downloadReceiptJson}
                    className="flex-1 py-3 px-4 rounded-xl text-xs font-semibold bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-800 flex items-center justify-center space-x-2"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download JSON</span>
                  </button>

                  <button
                    onClick={onClose}
                    className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center space-x-2"
                  >
                    <span>Finish Checkout</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* FAILURE / ERROR VIEW */}
            {checkoutStep === "failure" && errorMessage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6 py-2"
              >
                <div className="text-center space-y-2">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-450 shadow-lg shadow-rose-500/10">
                      <AlertTriangle className="w-8 h-8" />
                    </div>
                  </div>
                  <h2 className="text-xl font-bold text-rose-200">Payment Failed</h2>
                  <p className="text-xs text-rose-350 max-w-xs mx-auto leading-relaxed">{errorMessage}</p>
                </div>

                {fallbackProvider && (
                  <div className="bg-slate-950 p-4 rounded-2xl border border-cyan-500/25 flex items-center justify-between gap-3 text-xs max-w-sm mx-auto text-left">
                    <div>
                      <span className="text-[9px] font-mono text-cyan-400 uppercase font-bold block">
                        Recommended Fallback Node
                      </span>
                      <h5 className="font-bold text-white text-sm mt-0.5">{fallbackProvider.name}</h5>
                      <p className="text-slate-400">
                        ${fallbackProvider.price} • {fallbackProvider.qualityScore}% Quality
                      </p>
                    </div>

                    <button
                      onClick={() => handleSwitchToFallback(fallbackProvider)}
                      className="px-3.5 py-2 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center space-x-1 transition-colors shrink-0 font-mono"
                    >
                      <span>Fallback</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="flex space-x-3 pt-4 max-w-sm mx-auto">
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 px-4 rounded-xl text-xs font-semibold bg-slate-850 hover:bg-slate-800 text-slate-350"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setCheckoutStep("review")}
                    className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-400 text-slate-950 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Collapsible Protocol Trace Inspector */}
          {currentTrace && (checkoutStep === "success" || checkoutStep === "failure") && (
            <div className="pt-4 border-t border-slate-850">
              <button
                onClick={() => setShowTraceView(!showTraceView)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-850 text-slate-400 text-xs font-semibold flex items-center justify-between transition-colors font-mono"
              >
                <div className="flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span>Inspect x402 Protocol Trace</span>
                </div>
                {showTraceView ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showTraceView && (
                <div className="mt-3 bg-slate-950 p-4 rounded-xl border border-slate-850 max-h-[160px] overflow-y-auto space-y-2 text-[11px] font-mono">
                  {currentTrace.steps.map((step) => (
                    <div key={step.id} className="flex justify-between border-b border-slate-900 pb-1.5">
                      <span className="text-slate-500">{step.title}</span>
                      <span className={step.status === "success" ? "text-emerald-450" : "text-rose-450"}>
                        {step.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
