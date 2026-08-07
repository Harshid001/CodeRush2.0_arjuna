import { apis } from "@/lib/data/marketplaceApis";
import type { MarketplaceApi } from "@/lib/data/marketplaceApis";
import { checkPolicy } from "@/lib/x402/policy";
import { findBestProvider } from "@/lib/recommendation";
import { PolicyLimits, Provider } from "@/lib/x402/types";
import { intentParser, ParsedIntent } from "./IntentParser";

export interface CandidateComparison {
  api: MarketplaceApi;
  scores: { quality: number; price: number; reliability: number; latency: number };
  overallScore: number;
  rank: number;
}

export interface PolicyEvaluation {
  api: MarketplaceApi;
  passed: boolean;
  reason?: string;
}

export interface DecisionReport {
  prompt: string;
  intent: ParsedIntent;
  searchedCandidates: MarketplaceApi[];
  comparisons: CandidateComparison[];
  policyResults: PolicyEvaluation[];
  winner?: MarketplaceApi;
  winnerScore?: number;
  rationale: string;
  rejectedCandidates: { api: MarketplaceApi; reason: string }[];
  error?: string;
}

function parsePrice(p: string): number {
  return parseFloat(p.replace(/[^0-9.]/g, "")) || 0.05;
}

function apiToProvider(apiItem: MarketplaceApi): Provider {
  const numPrice = parsePrice(apiItem.price);
  const isUpto = apiItem.model?.toLowerCase().includes("cap") || apiItem.model?.toLowerCase().includes("upto");
  return {
    id: apiItem.id,
    name: apiItem.name,
    description: apiItem.desc || "Enterprise API Provider",
    category: apiItem.cat || "LLM & NLP",
    price: numPrice,
    paymentType: isUpto ? "upto" : "exact",
    qualityScore: apiItem.qualityScore || 90,
    payToAddress: "36UMZNGBAZMINJH7266YYGHTR2OLEHTFRREB6ROQI3XA54EQXXCLTZTMG4",
    network: "algorand-testnet",
    endpoint: apiItem.endpoint || `/api/providers/${apiItem.id}`,
    outputSchema: { status: "string", result: "object" },
    active: true,
  };
}

export class MarketplaceAgent {
  /**
   * Async Autonomous Pipeline Orchestration with DeepSeek Intent Parsing:
   * Parse Intent (via DeepSeek server route) -> Search Marketplace -> Compare Providers -> Evaluate Policy -> Run Decision Engine -> Select Winner
   */
  public async executeAsync(
    prompt: string,
    policyLimits: PolicyLimits = { perRequestMax: 5.0, perProviderDailyMax: 10.0, dailyMax: 20.0, minQualityScore: 70 },
    currentSpend: { today: number; todayByProvider: Record<string, number> } = { today: 0, todayByProvider: {} }
  ): Promise<DecisionReport> {
    // Stage 1: Parse Intent using DeepSeek AI (with deterministic fallback)
    const intent = await intentParser.parseAsync(prompt);
    return this.runPipelineWithIntent(prompt, intent, policyLimits, currentSpend);
  }

  /**
   * Sync Autonomous Pipeline Orchestration (Deterministic Fallback)
   */
  public execute(
    prompt: string,
    policyLimits: PolicyLimits = { perRequestMax: 5.0, perProviderDailyMax: 10.0, dailyMax: 20.0, minQualityScore: 70 },
    currentSpend: { today: number; todayByProvider: Record<string, number> } = { today: 0, todayByProvider: {} }
  ): DecisionReport {
    const intent = intentParser.parse(prompt);
    return this.runPipelineWithIntent(prompt, intent, policyLimits, currentSpend);
  }

  private runPipelineWithIntent(
    prompt: string,
    intent: ParsedIntent,
    policyLimits: PolicyLimits,
    currentSpend: { today: number; todayByProvider: Record<string, number> }
  ): DecisionReport {
    // Stage 2: Search Marketplace Providers
    let searchCategory = intent.category;
    let searchedCandidates = apis.filter((a) => {
      if (searchCategory === "General") return true;
      return (
        a.cat.toLowerCase().includes(searchCategory.toLowerCase()) ||
        a.name.toLowerCase().includes(searchCategory.toLowerCase()) ||
        a.desc.toLowerCase().includes(searchCategory.toLowerCase())
      );
    });

    if (searchedCandidates.length === 0) {
      searchedCandidates = [...apis];
    }

    // Stage 3: Compare & Score Providers based on Priority
    const comparisons: CandidateComparison[] = searchedCandidates.map((api) => {
      const priceVal = parsePrice(api.price);
      const qualityVal = api.qualityScore || 85;
      const relVal = api.reliability || 98;
      const latVal = api.latency || 120;

      let wQuality = 0.4;
      let wPrice = 0.3;
      let wRel = 0.2;
      let wLat = 0.1;

      if (intent.priority === "cost") {
        wPrice = 0.5;
        wQuality = 0.25;
      } else if (intent.priority === "quality") {
        wQuality = 0.55;
        wPrice = 0.15;
      } else if (intent.priority === "latency") {
        wLat = 0.4;
        wQuality = 0.3;
      } else if (intent.priority === "reliability") {
        wRel = 0.45;
        wQuality = 0.3;
      }

      const pScore = Math.max(0, 100 - priceVal * 2000);
      const lScore = Math.max(0, 100 - latVal / 20);

      const overallScore = parseFloat(
        (qualityVal * wQuality + pScore * wPrice + relVal * wRel + lScore * wLat).toFixed(1)
      );

      return {
        api,
        scores: {
          quality: qualityVal,
          price: priceVal,
          reliability: relVal,
          latency: latVal,
        },
        overallScore,
        rank: 0,
      };
    });

    comparisons.sort((a, b) => b.overallScore - a.overallScore);
    comparisons.forEach((c, idx) => (c.rank = idx + 1));

    // Stage 4: Run Policy Engine Check
    const policyResults: PolicyEvaluation[] = [];
    const eligibleForDecision: MarketplaceApi[] = [];
    const rejectedCandidates: { api: MarketplaceApi; reason: string }[] = [];

    const effectiveLimits: PolicyLimits = {
      ...policyLimits,
      perRequestMax: intent.maxBudgetUSD !== undefined ? Math.min(intent.maxBudgetUSD, policyLimits.perRequestMax) : policyLimits.perRequestMax,
    };

    for (const c of comparisons) {
      const api = c.api;
      const numPrice = parsePrice(api.price);

      const check = checkPolicy(
        {
          providerId: api.id,
          estimatedCost: numPrice,
          providerQuality: api.qualityScore || 85,
        },
        effectiveLimits,
        currentSpend
      );

      if (check.allowed) {
        policyResults.push({ api, passed: true });
        eligibleForDecision.push(api);
      } else {
        const failReason = check.reason || "Failed policy security checks.";
        policyResults.push({ api, passed: false, reason: failReason });
        rejectedCandidates.push({ api, reason: failReason });
      }
    }

    if (eligibleForDecision.length === 0) {
      return {
        prompt,
        intent,
        searchedCandidates,
        comparisons,
        policyResults,
        rationale: "No marketplace provider passed your active safety & budget policy limits.",
        rejectedCandidates,
        error: "NO_PROVIDER_PASSED_POLICY",
      };
    }

    // Stage 5: Run Decision Engine
    const providerList: Provider[] = eligibleForDecision.map(apiToProvider);
    const bestProvider = findBestProvider(providerList, undefined, undefined, effectiveLimits.minQualityScore);

    const winnerApi = searchedCandidates.find((a) => a.id === bestProvider?.id) || eligibleForDecision[0];
    const winnerComp = comparisons.find((c) => c.api.id === winnerApi.id);

    const sourceTag = intent.parserSource === "deepseek" ? " (Parsed via DeepSeek AI)" : "";

    const rationale = `Selected '${winnerApi.name}' because it achieved the highest composite decision score (${winnerComp?.overallScore || 92.5}/100) matching your '${intent.category}' task with ${intent.priority} priority optimization at ${winnerApi.price} per request${sourceTag}.`;

    return {
      prompt,
      intent,
      searchedCandidates,
      comparisons,
      policyResults,
      winner: winnerApi,
      winnerScore: winnerComp?.overallScore || 92.5,
      rationale,
      rejectedCandidates,
    };
  }
}

export const marketplaceAgent = new MarketplaceAgent();
