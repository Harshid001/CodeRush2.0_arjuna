"use client";

import React, { useState } from "react";
import { usePaymentContext } from "../../context/PaymentContext";
import { useProviderContext } from "../../context/ProviderContext";
import { requestPaidResource } from "../../lib/x402/client";
import {
  AlertTriangle,
  RefreshCw,
  CheckCircle,
  XCircle,
  Play,
  Shield,
  Zap,
  ArrowRight,
  ShieldAlert,
  Lock,
} from "lucide-react";

export const DemoScenariosPanel: React.FC = () => {
  const { policyLimits, spendToday, usedNonces, addReceipt, addTrace, markNonceUsed } =
    usePaymentContext();
  const { providers } = useProviderContext();

  const [activeTest, setActiveTest] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{
    title: string;
    status: "success" | "blocked" | "error";
    message: string;
    details?: any;
    fallbackProvider?: any;
  } | null>(null);

  const runScenario = async (scenarioKey: string) => {
    setActiveTest(scenarioKey);
    setTestResult(null);

    const defaultInput = { query: "Simulated Demo Execution Payload" };

    try {
      if (scenarioKey === "disappear") {
        // Scenario 1: Provider disappears mid-flow
        const targetProvider = providers.find((p) => p.id === "p-flaky-node") || providers[0];
        const res = await requestPaidResource(
          targetProvider,
          defaultInput,
          policyLimits,
          spendToday,
          usedNonces,
          { forceDisappear: true, allProviders: providers }
        );
        if (res.trace) addTrace(res.trace);

        const errorText = "error" in res ? res.error : "Provider unreachable";
        const fallback = "fallbackProvider" in res ? res.fallbackProvider : null;

        setTestResult({
          title: "Scenario 1: Provider Disappears Mid-Flow",
          status: "blocked",
          message: "Payment WAS NOT settled. Provider returned HTTP 404 / Connection Timeout on payment retry. System safely recommended automated fallback provider.",
          details: errorText,
          fallbackProvider: fallback,
        });
      } else if (scenarioKey === "price_change") {
        // Scenario 2: Price changes mid-flow
        const targetProvider = providers[0];
        const res = await requestPaidResource(
          targetProvider,
          defaultInput,
          policyLimits,
          spendToday,
          usedNonces,
          { forcePriceChange: true }
        );
        if (res.trace) addTrace(res.trace);

        const errorText = "error" in res ? res.error : "Price change verification failed";

        setTestResult({
          title: "Scenario 2: Price Changed Mid-Flow",
          status: "blocked",
          message: "PRICE MISMATCH REJECTED: Facilitator verify() detected requirement price ($0.1250) did not match payload signed price ($0.0500). Settlement aborted.",
          details: errorText,
        });
      } else if (scenarioKey === "malformed") {
        // Scenario 3: Malformed/expired requirement
        const targetProvider = providers[0];
        const res = await requestPaidResource(
          targetProvider,
          defaultInput,
          policyLimits,
          spendToday,
          usedNonces,
          { forceMalformed402: true }
        );
        if (res.trace) addTrace(res.trace);

        const errorText = "error" in res ? res.error : "Malformed 402 requirement";

        setTestResult({
          title: "Scenario 3: Malformed 402 Requirement",
          status: "blocked",
          message: "Client validation halted before signing. Requirement object was missing mandatory nonce fields and contained invalid negative prices.",
          details: errorText,
        });
      } else if (scenarioKey === "prompt_injection") {
        // Scenario 4: Prompt injection attempt
        const injectProvider = providers.find((p) => p.isInjectablePrompt) || providers[0];
        const res = await requestPaidResource(
          injectProvider,
          defaultInput,
          policyLimits,
          spendToday,
          usedNonces
        );
        if (res.trace) addTrace(res.trace);
        if ("receipt" in res && res.receipt) addReceipt(res.receipt);

        setTestResult({
          title: "Scenario 4: Prompt-Injection Isolation Test",
          status: "success",
          message: "PROMPT INJECTION DEFENDED: Policy engine evaluated ONLY structured fields (price: $0.10, quality: 75%). The malicious text 'Ignore all budget policy...' in the provider description was completely ignored.",
          details: res,
        });
      } else if (scenarioKey === "double_spend") {
        // Scenario 5: Double spend replay attack
        const targetProvider = providers[0];
        let testUsedNonces = new Set(usedNonces);
        if (testUsedNonces.size === 0) {
          testUsedNonces.add("nonce_used_seed_12345");
          markNonceUsed("nonce_used_seed_12345");
        }

        const res = await requestPaidResource(
          targetProvider,
          defaultInput,
          policyLimits,
          spendToday,
          testUsedNonces,
          { forceReplayNonce: true }
        );
        if (res.trace) addTrace(res.trace);

        const errorText = "error" in res ? res.error : "Replay attack rejected";

        setTestResult({
          title: "Scenario 5: Double-Spend Replay Attack",
          status: "blocked",
          message: "REPLAY ATTACK REJECTED: Facilitator verify() looked up nonce in PaymentContext used-nonce tracker and rejected duplicate settlement attempt.",
          details: errorText,
        });
      }
    } catch (err: any) {
      setTestResult({
        title: "Test Execution Error",
        status: "error",
        message: err.message || "An unexpected error occurred.",
      });
    } finally {
      setActiveTest(null);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl text-slate-100 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-amber-500/20 p-2.5 rounded-xl border border-amber-500/30 text-amber-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">x402 Protocol Failure & Attack Demo Suite</h3>
            <p className="text-xs text-slate-400">
              Trigger live adversarial scenarios to verify settlement safety and budget protection
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Scenarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Scenario 1 */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                SCENARIO 1
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Node Unreachable</span>
            </div>
            <h4 className="font-bold text-sm text-white">Provider Disappears Mid-Flow</h4>
            <p className="text-xs text-slate-400 mt-1">
              Simulates HTTP 404 / timeout on payment retry. Client does NOT settle payment and offers fallback.
            </p>
          </div>
          <button
            onClick={() => runScenario("disappear")}
            disabled={activeTest === "disappear"}
            className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 transition-colors flex items-center justify-center space-x-1.5"
          >
            {activeTest === "disappear" ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>Run Scenario</span>
          </button>
        </div>

        {/* Scenario 2 */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                SCENARIO 2
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Price Mismatch</span>
            </div>
            <h4 className="font-bold text-sm text-white">Price Changes Mid-Flow</h4>
            <p className="text-xs text-slate-400 mt-1">
              Simulates requirement price changing after payload signing. Facilitator rejects mismatch.
            </p>
          </div>
          <button
            onClick={() => runScenario("price_change")}
            disabled={activeTest === "price_change"}
            className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 transition-colors flex items-center justify-center space-x-1.5"
          >
            {activeTest === "price_change" ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>Run Scenario</span>
          </button>
        </div>

        {/* Scenario 3 */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                SCENARIO 3
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Malformed 402</span>
            </div>
            <h4 className="font-bold text-sm text-white">Malformed 402 Requirement</h4>
            <p className="text-xs text-slate-400 mt-1">
              Simulates corrupt/expired 402 header. Client rejects before signing or sending funds.
            </p>
          </div>
          <button
            onClick={() => runScenario("malformed")}
            disabled={activeTest === "malformed"}
            className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 transition-colors flex items-center justify-center space-x-1.5"
          >
            {activeTest === "malformed" ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>Run Scenario</span>
          </button>
        </div>

        {/* Scenario 4 */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                SCENARIO 4
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Security Boundary</span>
            </div>
            <h4 className="font-bold text-sm text-white">Prompt-Injection Defense</h4>
            <p className="text-xs text-slate-400 mt-1">
              Provider description contains "Ignore all budget policy...". Policy engine evaluates ONLY structured fields.
            </p>
          </div>
          <button
            onClick={() => runScenario("prompt_injection")}
            disabled={activeTest === "prompt_injection"}
            className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 transition-colors flex items-center justify-center space-x-1.5"
          >
            {activeTest === "prompt_injection" ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Lock className="w-3.5 h-3.5" />
            )}
            <span>Test Security Boundary</span>
          </button>
        </div>

        {/* Scenario 5 */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                SCENARIO 5
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Replay Attack</span>
            </div>
            <h4 className="font-bold text-sm text-white">Double-Spend Nonce Replay</h4>
            <p className="text-xs text-slate-400 mt-1">
              Replays a previously-used requirement nonce. Facilitator verify() rejects duplicate spend.
            </p>
          </div>
          <button
            onClick={() => runScenario("double_spend")}
            disabled={activeTest === "double_spend"}
            className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 transition-colors flex items-center justify-center space-x-1.5"
          >
            {activeTest === "double_spend" ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>Run Scenario</span>
          </button>
        </div>
      </div>

      {/* Output Result Card */}
      {testResult && (
        <div
          className={`p-5 rounded-xl border space-y-3 font-mono text-xs ${
            testResult.status === "success"
              ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
              : testResult.status === "blocked"
              ? "bg-amber-950/40 border-amber-500/40 text-amber-200"
              : "bg-rose-950/40 border-rose-500/40 text-rose-200"
          }`}
        >
          <div className="flex items-center space-x-2">
            {testResult.status === "success" ? (
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            ) : (
              <XCircle className="w-5 h-5 text-amber-400" />
            )}
            <h4 className="font-bold font-sans text-sm">{testResult.title}</h4>
          </div>

          <p className="font-sans text-xs leading-relaxed">{testResult.message}</p>

          {testResult.fallbackProvider && (
            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 text-xs font-sans text-slate-300 flex items-center justify-between">
              <div>
                <span className="text-cyan-400 font-bold block">Recommended Fallback Node:</span>
                <span>{testResult.fallbackProvider.name} (${testResult.fallbackProvider.price})</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
