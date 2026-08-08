import { Provider } from '@/lib/x402/types';

export interface ProviderExecutionResult {
  success: boolean;
  providerId: string;
  providerName: string;
  category: string;
  result: any;
  latency: number;
  usage: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
    unit?: string;
    amount?: number;
  };
  cost: number;
  isSimulated: boolean;
}

export interface ProviderAdapter {
  execute(input: string, provider: Provider): Promise<ProviderExecutionResult>;
}
