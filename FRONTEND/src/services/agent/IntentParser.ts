/**
 * LIGHTWEIGHT DETERMINISTIC INTENT PARSER
 * Evaluates natural language user prompts into structured search & decision parameters.
 * Does NOT use an external LLM. Uses deterministic keyword & pattern matching.
 */

export type AgentCategory =
  | "OCR"
  | "Translation"
  | "Embeddings"
  | "Speech-to-Text"
  | "Text Generation"
  | "Moderation"
  | "Risk Scoring"
  | "Image Generation"
  | "Geocoding"
  | "General";

export type AgentPriority = "cost" | "quality" | "latency" | "reliability" | "balanced";

export interface ParsedIntent {
  rawPrompt: string;
  category: AgentCategory;
  priority: AgentPriority;
  maxBudgetUSD?: number;
  extractedKeywords: string[];
  confidence: number;
}

const CATEGORY_KEYWORDS: Record<AgentCategory, string[]> = {
  OCR: ["ocr", "invoice", "receipt", "scan", "document", "extract text", "pdf text", "pdf parsing", "image text", "handwriting"],
  Translation: ["translate", "translation", "language", "hindi", "spanish", "french", "german", "multilingual", "localize"],
  Embeddings: ["embedding", "embeddings", "vector", "semantic search", "rag", "similarity", "ada", "vectorize"],
  "Speech-to-Text": ["whisper", "speech", "audio", "transcribe", "transcription", "voice", "stt", "listen"],
  "Text Generation": ["generate text", "llm", "llama", "gpt", "writer", "summarize", "chat", "completion", "article", "code generation"],
  Moderation: ["moderate", "moderation", "safety", "toxic", "content filter", "nsfw", "spam", "abuse"],
  "Risk Scoring": ["risk", "fraud", "score", "credit", "transaction risk", "security check", "threat", "risk assessment"],
  "Image Generation": ["generate image", "diffusion", "dall-e", "picture", "art", "draw", "render image", "stable diffusion"],
  Geocoding: ["geo", "geocoding", "map", "location", "address", "coordinates", "gps", "lat long"],
  General: [],
};

const PRIORITY_KEYWORDS: Record<AgentPriority, string[]> = {
  cost: ["cheap", "cheapest", "low cost", "budget", "affordable", "free", "minimal price", "lowest price"],
  quality: ["best quality", "highest quality", "accurate", "precision", "expert", "premium", "top tier", "benchmark"],
  latency: ["fast", "fastest", "real-time", "instant", "low latency", "quick", "speed", "under 100ms"],
  reliability: ["reliable", "high uptime", "stable", "sla", "guaranteed", "failsafe", "redundant"],
  balanced: ["balanced", "optimal", "best value", "recommended"],
};

export class IntentParser {
  public parse(prompt: string): ParsedIntent {
    const clean = prompt.toLowerCase().trim();

    // 1. Detect Category
    let detectedCategory: AgentCategory = "General";
    let maxCategoryMatches = 0;
    const extractedKeywords: string[] = [];

    for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS) as [AgentCategory, string[]][]) {
      let matches = 0;
      for (const kw of keywords) {
        if (clean.includes(kw)) {
          matches++;
          extractedKeywords.push(kw);
        }
      }
      if (matches > maxCategoryMatches) {
        maxCategoryMatches = matches;
        detectedCategory = cat;
      }
    }

    // 2. Detect Priority
    let detectedPriority: AgentPriority = "balanced";
    let maxPriorityMatches = 0;

    for (const [prio, keywords] of Object.entries(PRIORITY_KEYWORDS) as [AgentPriority, string[]][]) {
      let matches = 0;
      for (const kw of keywords) {
        if (clean.includes(kw)) {
          matches++;
        }
      }
      if (matches > maxPriorityMatches) {
        maxPriorityMatches = matches;
        detectedPriority = prio;
      }
    }

    // 3. Detect Budget ($0.05, $1, under $0.02)
    let maxBudgetUSD: number | undefined = undefined;
    const budgetMatch = clean.match(/(\$|\b)(0\.\d{1,4}|\d+(\.\d{1,2})?)\s*(usd|dollars|\$)?/i);
    if (budgetMatch) {
      const parsedVal = parseFloat(budgetMatch[2]);
      if (!isNaN(parsedVal) && parsedVal > 0 && parsedVal < 100) {
        maxBudgetUSD = parsedVal;
      }
    }

    // 4. Calculate Confidence Score (0.60 to 0.98)
    const confidence = Math.min(0.98, Math.max(0.65, 0.65 + maxCategoryMatches * 0.1));

    return {
      rawPrompt: prompt,
      category: detectedCategory,
      priority: detectedPriority,
      maxBudgetUSD,
      extractedKeywords: Array.from(new Set(extractedKeywords)),
      confidence: parseFloat(confidence.toFixed(2)),
    };
  }
}

export const intentParser = new IntentParser();
