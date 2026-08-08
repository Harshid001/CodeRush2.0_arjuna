import { Provider } from '@/lib/x402/types';
import { ProviderAdapter, ProviderExecutionResult } from '../ProviderAdapter';

export class ModerationAdapter implements ProviderAdapter {
  async execute(input: string, provider: Provider): Promise<ProviderExecutionResult> {
    const isSuspicious = input.toLowerCase().includes('kill') || input.toLowerCase().includes('hate') || input.toLowerCase().includes('violate') || input.toLowerCase().includes('spam');
    
    const result = {
      safe: !isSuspicious,
      categories: {
        hate: input.toLowerCase().includes('hate'),
        violence: input.toLowerCase().includes('kill'),
        sexual: false,
        spam: input.toLowerCase().includes('spam')
      },
      confidence: 0.96
    };

    return {
      success: true,
      providerId: provider.id,
      providerName: provider.name,
      category: 'Moderation',
      result,
      latency: Math.floor(40 + Math.random() * 30),
      usage: {
        promptTokens: Math.floor(input.length / 4) + 1,
        unit: 'token'
      },
      cost: provider.price,
      isSimulated: true
    };
  }
}
