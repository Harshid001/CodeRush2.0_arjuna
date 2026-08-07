import { Provider } from "./x402/types";

/**
 * RECOMMENDATION & RANKING ENGINE
 * Ranks available providers by quality score and price efficiency.
 * Used for marketplace discovery and automated mid-flow fallback recommendations.
 */

export function findBestProvider(
  providers: Provider[],
  category?: string,
  excludeProviderId?: string,
  minQuality: number = 70
): Provider | undefined {
  // Filter eligible active providers
  const candidates = providers.filter((p) => {
    if (!p.active) return false;
    if (excludeProviderId && p.id === excludeProviderId) return false;
    if (p.qualityScore < minQuality) return false;
    if (category && category !== "All" && p.category !== category) return false;
    return true;
  });

  if (candidates.length === 0) {
    // If no candidate matching exact category, search without category constraint
    const fallbackCandidates = providers.filter(
      (p) => p.active && p.id !== excludeProviderId && p.qualityScore >= minQuality
    );
    if (fallbackCandidates.length === 0) return undefined;
    return fallbackCandidates.sort((a, b) => b.qualityScore - a.qualityScore)[0];
  }

  // Rank candidate providers: higher quality score per dollar price ratio
  return candidates.sort((a, b) => {
    const scoreA = a.qualityScore / Math.max(0.01, a.price);
    const scoreB = b.qualityScore / Math.max(0.01, b.price);
    return scoreB - scoreA;
  })[0];
}
