import { Provider } from '@/lib/x402/types';
import { ProviderAdapter, ProviderExecutionResult } from './ProviderAdapter';
import { OcrAdapter } from './adapters/ocr.adapter';
import { TranslationAdapter } from './adapters/translation.adapter';
import { EmbeddingsAdapter } from './adapters/embeddings.adapter';
import { TextGenerationAdapter } from './adapters/text-generation.adapter';
import { SpeechToTextAdapter } from './adapters/speech-to-text.adapter';
import { ImageGenerationAdapter } from './adapters/image-generation.adapter';
import { ModerationAdapter } from './adapters/moderation.adapter';
import { RiskScoringAdapter } from './adapters/risk-scoring.adapter';
import { GeocodingAdapter } from './adapters/geocoding.adapter';
import { SentimentAdapter } from './adapters/sentiment.adapter';

class ProviderExecutionService {
  private adapters: Record<string, ProviderAdapter> = {};

  constructor() {
    this.adapters['ocr'] = new OcrAdapter();
    this.adapters['translation'] = new TranslationAdapter();
    this.adapters['embeddings'] = new EmbeddingsAdapter();
    this.adapters['text generation'] = new TextGenerationAdapter();
    this.adapters['speech-to-text'] = new SpeechToTextAdapter();
    this.adapters['image generation'] = new ImageGenerationAdapter();
    this.adapters['moderation'] = new ModerationAdapter();
    this.adapters['risk scoring'] = new RiskScoringAdapter();
    this.adapters['geocoding'] = new GeocodingAdapter();
    this.adapters['sentiment analysis'] = new SentimentAdapter();
  }

  public async executeProvider(input: string, provider: Provider): Promise<ProviderExecutionResult> {
    const categoryKey = (provider.category || '').toLowerCase().trim();
    
    // Find matched adapter, or fallback to Text Generation
    let adapter = this.adapters[categoryKey];
    
    // Try fuzzy match if exact key isn't found
    if (!adapter) {
      const matchKey = Object.keys(this.adapters).find(k => categoryKey.includes(k) || k.includes(categoryKey));
      if (matchKey) {
        adapter = this.adapters[matchKey];
      } else {
        // Fallback to text generation for general queries
        adapter = this.adapters['text generation'];
      }
    }

    try {
      return await adapter.execute(input, provider);
    } catch (err: any) {
      console.error(`[ProviderExecutionService] Adapter execution failed for ${provider.name}:`, err);
      // Construct a generic error response rather than crashing the flow
      return {
        success: false,
        providerId: provider.id,
        providerName: provider.name,
        category: provider.category,
        result: { error: err?.message || String(err) },
        latency: 120,
        usage: { amount: 0, unit: 'call' },
        cost: 0,
        isSimulated: true
      };
    }
  }
}

export const providerExecutionService = new ProviderExecutionService();
export default providerExecutionService;
