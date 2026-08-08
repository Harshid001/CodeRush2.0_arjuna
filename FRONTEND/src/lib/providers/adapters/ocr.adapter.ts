import { Provider } from '@/lib/x402/types';
import { ProviderAdapter, ProviderExecutionResult } from '../ProviderAdapter';

export class OcrAdapter implements ProviderAdapter {
  async execute(input: string, provider: Provider): Promise<ProviderExecutionResult> {
    const isCustomInput = input && input.trim().length > 0 && !input.toLowerCase().includes('extract text');
    
    const result = {
      text: isCustomInput 
        ? `[SIMULATED OCR TEXT EXTRACTED FROM CUSTOM PROMPT]\nInput description matched:\n"${input}"\n\nInvoice #INV-9982\nSubtotal: $120.00\nTax (8%): $9.60\nTotal Amount: $129.60\nDue Date: 2026-08-15`
        : "Invoice #INV-1024\nTotal: $49.99\nDate: 2026-08-08\nVendor: Acme Corp\nLine Items:\n1. Cloud Compute API Access - $49.99",
      confidence: 0.98,
      language: "English"
    };

    return {
      success: true,
      providerId: provider.id,
      providerName: provider.name,
      category: 'OCR',
      result,
      latency: Math.floor(100 + Math.random() * 80),
      usage: {
        amount: 1,
        unit: 'page'
      },
      cost: provider.price,
      isSimulated: true
    };
  }
}
