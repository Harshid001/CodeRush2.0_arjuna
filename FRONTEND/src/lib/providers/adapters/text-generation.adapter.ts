import { Provider } from '@/lib/x402/types';
import { ProviderAdapter, ProviderExecutionResult } from '../ProviderAdapter';

const LAPTOP_MOCK = "Elevate your productivity with the new simulated QuantumBook Pro. Engineered with a blazing-fast octa-core neural processor, 16GB of unified memory, and a vibrant 14.2-inch Retina-grade display. Boasting a solid-state drive with 512GB of high-speed storage and an all-day 18-hour battery life, this sleek aluminum laptop is designed to handle demanding workflows, software compilation, and creative suites with absolute ease. Experience next-level mobile computing today.";
const DEFAULT_MOCK = "Based on your prompt, here is a professional simulated text output: NexusAPI provides a secure, decentralized network protocol (x402) built on the Algorand blockchain to bridge developer agents and microservice providers. It permits granular budget controls, policy checking, and sub-second payment settlement using smart utility tokens.";

export class TextGenerationAdapter implements ProviderAdapter {
  async execute(input: string, provider: Provider): Promise<ProviderExecutionResult> {
    const isLaptop = input.toLowerCase().includes('laptop') || input.toLowerCase().includes('product description');
    const generatedText = isLaptop ? LAPTOP_MOCK : DEFAULT_MOCK;

    const result = {
      text: generatedText,
      model: provider.id.replace('p-', ''),
      finishReason: 'stop',
      usage: {
        promptTokens: Math.floor(input.length / 4) + 12,
        completionTokens: Math.floor(generatedText.length / 4),
        totalTokens: Math.floor(input.length / 4) + Math.floor(generatedText.length / 4) + 12
      }
    };

    return {
      success: true,
      providerId: provider.id,
      providerName: provider.name,
      category: 'Text Generation',
      result,
      latency: Math.floor(200 + Math.random() * 150),
      usage: {
        promptTokens: result.usage.promptTokens,
        completionTokens: result.usage.completionTokens,
        totalTokens: result.usage.totalTokens,
        unit: 'token'
      },
      cost: provider.price,
      isSimulated: true
    };
  }
}
