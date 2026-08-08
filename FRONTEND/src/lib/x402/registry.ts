import seedData from "./providers.seed.json";
import { Provider } from "./types";
import { ALGORAND_TESTNET_CAIP2 } from "@x402-avm/avm";

export interface SeedProviderEntry {
  providerId: string;
  name: string;
  category: string;
  description: string;
  endpoint: string;
  payTo: string;
  priceMicroUsdc: number;
  priceDisplay: string;
  unit: string;
  active: boolean;
}

export interface SeedAssetConfig {
  id: number;
  symbol: string;
  decimals: number;
  network: string;
}

class ProviderRegistry {
  private byId: Map<string, SeedProviderEntry> = new Map();
  private bySlug: Map<string, SeedProviderEntry> = new Map();
  public asset: SeedAssetConfig;

  constructor() {
    this.asset = seedData.asset;
    this.initRegistry();
  }

  private initRegistry() {
    const endpointsSeen = new Set<string>();
    const fallbackPayTo = process.env.RESOURCE_PAY_TO || "36UMZNGBAZMINJH7266YYGHTR2OLEHTFRREB6ROQI3XA54EQXXCLTZTMG4";

    for (const entry of seedData.providers) {
      const cleanEndpoint = entry.endpoint.toLowerCase().replace(/\/$/, "");
      const slug = cleanEndpoint.split("/").pop() || cleanEndpoint;

      // Rule 3: Enforce strict 1-to-1 endpoint uniqueness collision check
      if (endpointsSeen.has(cleanEndpoint)) {
        throw new Error(
          `[ProviderRegistry FATAL] Endpoint collision detected! Multiple providers claim endpoint '${entry.endpoint}'. Provider ID: '${entry.providerId}'`
        );
      }
      endpointsSeen.add(cleanEndpoint);

      // Rule 1: Only warn when the provider is still using a placeholder and no demo fallback is configured.
      if (entry.payTo.startsWith("REPLACE_WITH_") && fallbackPayTo.startsWith("REPLACE_WITH_")) {
        console.warn(
          `[ProviderRegistry WARN] Provider '${entry.providerId}' has an unconfigured placeholder payTo address: '${entry.payTo}'.` +
            ` The app is falling back to the default demo payTo: '${fallbackPayTo}'.`
        );
      }

      this.byId.set(entry.providerId, entry);
      this.bySlug.set(slug, entry);
      this.bySlug.set(cleanEndpoint, entry);
    }

    console.log(
      `[ProviderRegistry] Successfully loaded ${this.byId.size} providers from seed dataset. Live Demo Provider: '${this.getLiveDemoProvider().providerId}' -> payTo: '${this.getLiveDemoProvider().payTo}'`
    );
  }

  public getProviderEntry(idOrSlug: string): SeedProviderEntry {
    if (!idOrSlug) return this.getLiveDemoProvider();
    const cleanKey = idOrSlug.toLowerCase().replace(/\/$/, "");
    const slugKey = cleanKey.split("/").pop() || cleanKey;

    const found =
      this.byId.get(idOrSlug) ||
      this.bySlug.get(cleanKey) ||
      this.bySlug.get(slugKey);

    if (found) return found;

    const defaultPayTo = process.env.RESOURCE_PAY_TO || "36UMZNGBAZMINJH7266YYGHTR2OLEHTFRREB6ROQI3XA54EQXXCLTZTMG4";
    const formattedName = slugKey
      .replace(/^p-/, "")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

    return {
      providerId: idOrSlug,
      name: formattedName,
      category: "general",
      description: `x402 protected AI service endpoint for ${formattedName}`,
      endpoint: `/api/providers/${idOrSlug}`,
      payTo: defaultPayTo,
      priceMicroUsdc: 10000,
      priceDisplay: "$0.01 / request",
      unit: "per_request",
      active: true,
    };
  }

  public getLiveDemoProvider(): SeedProviderEntry {
    const live = this.byId.get("prov_demo_live");
    if (!live) {
      throw new Error("[ProviderRegistry FATAL] Live demo provider 'prov_demo_live' missing from seed file!");
    }
    return live;
  }

  public getAllProviders(): Provider[] {
    return Array.from(this.byId.values()).map((entry) => this.toProviderObject(entry));
  }

  public toProviderObject(entry: SeedProviderEntry): Provider {
    const priceUsd = entry.priceMicroUsdc / 1000000;
    const defaultPayTo = process.env.RESOURCE_PAY_TO || "36UMZNGBAZMINJH7266YYGHTR2OLEHTFRREB6ROQI3XA54EQXXCLTZTMG4";
    const payTo = (!entry.payTo || entry.payTo.startsWith("REPLACE_WITH_")) ? defaultPayTo : entry.payTo;

    return {
      id: entry.providerId,
      name: entry.name,
      description: entry.description,
      category: entry.category,
      price: priceUsd,
      paymentType: "exact",
      qualityScore: entry.providerId === "prov_demo_live" ? 98 : 90,
      payToAddress: payTo,
      network: ALGORAND_TESTNET_CAIP2,
      endpoint: entry.endpoint,
      outputSchema: { status: "string", result: "object" },
      active: entry.active,
    };
  }
}

export const registry = new ProviderRegistry();

export function getProvider(idOrSlug: string): Provider {
  const entry = registry.getProviderEntry(idOrSlug);
  return registry.toProviderObject(entry);
}
