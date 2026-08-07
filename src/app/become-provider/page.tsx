"use client";

import React, { useState } from "react";
import { useProviderContext } from "../../context/ProviderContext";
import { PaymentScheme } from "../../lib/x402/types";
import { PlusCircle, CheckCircle2, ArrowLeft, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function BecomeProviderPage() {
  const { addProvider } = useProviderContext();
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<
    "LLM & NLP" | "Computer Vision" | "Financial & Market Data" | "Code & DevTools" | "Audio & Speech" | "Web Scraping"
  >("LLM & NLP");
  const [price, setPrice] = useState("0.10");
  const [paymentType, setPaymentType] = useState<PaymentScheme>("exact");
  const [qualityScore, setQualityScore] = useState("95");
  const [network, setNetwork] = useState("base-sepolia");
  const [payToAddress, setPayToAddress] = useState("0x_sim_recip_my_node_99");
  const [endpoint, setEndpoint] = useState("https://api.my-node.ai/v1/inference");

  const [publishedSuccess, setPublishedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !price) return;

    addProvider({
      name,
      description,
      category,
      price: parseFloat(price),
      paymentType,
      qualityScore: parseInt(qualityScore, 10),
      payToAddress,
      network,
      endpoint,
      outputSchema: { status: "string", data: "object" },
      active: true,
    });

    setPublishedSuccess(true);
    setTimeout(() => {
      router.push("/marketplace");
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <Link
        href="/marketplace"
        className="inline-flex items-center text-xs text-slate-400 hover:text-white space-x-1"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Marketplace</span>
      </Link>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              x402 Node Publisher
            </span>
            <h1 className="text-2xl font-bold text-white">Publish New Paid API Service</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Register your API service endpoint into the marketplace. Set pricing scheme and x402 payment requirements.
          </p>
        </div>

        {publishedSuccess && (
          <div className="bg-emerald-950/60 border border-emerald-500/40 p-4 rounded-xl text-emerald-300 flex items-center space-x-2 text-xs font-bold font-mono">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>API Node published successfully! Redirecting to Marketplace...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Service Name</label>
              <input
                type="text"
                required
                placeholder="e.g. DeepLlama Sentiment Pro"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-cyan-400 focus:outline-none"
              >
                <option value="LLM & NLP">LLM & NLP</option>
                <option value="Computer Vision">Computer Vision</option>
                <option value="Financial & Market Data">Financial & Market Data</option>
                <option value="Code & DevTools">Code & DevTools</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-semibold">Description</label>
            <textarea
              rows={3}
              required
              placeholder="Describe API capabilities, accuracy, and supported data inputs..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Payment Scheme</label>
              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value as PaymentScheme)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-cyan-400 focus:outline-none font-mono"
              >
                <option value="exact">EXACT (Fixed Price)</option>
                <option value="upto">UPTO (Metered Usage Cap)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Price / Max Cap ($)</label>
              <input
                type="number"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-mono focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Quality Score (0-100%)</label>
              <input
                type="number"
                min="1"
                max="100"
                required
                value={qualityScore}
                onChange={(e) => setQualityScore(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-mono focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Network</label>
              <input
                type="text"
                value={network}
                onChange={(e) => setNetwork(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-mono focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Recipient Identifier</label>
              <input
                type="text"
                value={payToAddress}
                onChange={(e) => setPayToAddress(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-mono focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-semibold">Endpoint URL</label>
            <input
              type="text"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-mono focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-xl font-extrabold text-sm bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center space-x-2"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Publish API Provider to Marketplace</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
