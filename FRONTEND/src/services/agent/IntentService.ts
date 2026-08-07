import { deepSeekService } from '@/services/ai/deepseek.service';
import type { DeepSeekIntentResponse } from '@/types/agent.types';
import { intentParser, ParsedIntent } from './IntentParser';

export class IntentService {
  /**
   * Async Intent Parsing:
   * Uses DeepSeek V4 Pro via server API route /api/agent to convert natural language prompt to structured JSON intent.
   * Falls back gracefully to deterministic keyword parser if DeepSeek API is offline or returns error.
   */
  public async extractIntent(prompt: string): Promise<ParsedIntent> {
    try {
      const res: DeepSeekIntentResponse = await deepSeekService.parseIntent(prompt);
      const catLower = (res.category || '').toLowerCase();
      const prioLower = (res.priority || '').toLowerCase();

      const matchedCategory =
        catLower.includes('ocr') || catLower.includes('invoice') ? 'OCR' :
        catLower.includes('translate') || catLower.includes('translation') ? 'Translation' :
        catLower.includes('embed') ? 'Embeddings' :
        catLower.includes('speech') || catLower.includes('audio') || catLower.includes('transcribe') ? 'Speech-to-Text' :
        catLower.includes('text') || catLower.includes('llm') || catLower.includes('gpt') ? 'Text Generation' :
        catLower.includes('image') || catLower.includes('draw') ? 'Image Generation' :
        catLower.includes('moderat') || catLower.includes('safety') ? 'Moderation' :
        catLower.includes('risk') || catLower.includes('fraud') ? 'Risk Scoring' :
        catLower.includes('geo') || catLower.includes('map') ? 'Geocoding' : 'General';

      const matchedPriority =
        prioLower.includes('price') || prioLower.includes('cheap') || prioLower.includes('cost') ? 'cost' :
        prioLower.includes('quality') || prioLower.includes('accurate') ? 'quality' :
        prioLower.includes('latency') || prioLower.includes('fast') || prioLower.includes('speed') ? 'latency' :
        prioLower.includes('reliable') || prioLower.includes('sla') ? 'reliability' : 'balanced';

      const budgetVal = typeof res.budget === 'number' && res.budget > 0 ? res.budget : undefined;

      return {
        rawPrompt: prompt,
        category: matchedCategory as any,
        priority: matchedPriority as any,
        maxBudgetUSD: budgetVal,
        extractedKeywords: res.constraints || [],
        confidence: 0.98,
        parserSource: 'deepseek',
      };
    } catch (err) {
      console.warn('[IntentService] DeepSeek intent extraction fallback:', err);
      return {
        ...intentParser.parse(prompt),
        parserSource: 'deterministic',
      };
    }
  }
}

export const intentService = new IntentService();
