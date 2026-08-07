export type PaymentType = 'exact' | 'upto';

export interface Provider {
  id: string;
  providerName: string;
  companyName: string;
  logoUrl: string;
  website: string;
  email: string;
  description: string;
  category: string;
  apiEndpoint: string;
  version: string;
  network: string;
  paymentType: PaymentType;
  pricePerRequest: number;
  avgLatency: number;
  qualityScore: number;
  reliability: number;
  rateLimit: number;
  authType: string;
  supportedMethods: string[];
  inputSchema: string;
  outputSchema: string;
  tags: string[];
  termsAccepted: boolean;
  createdAt: string;
}

export type ProviderFormData = Omit<Provider, 'id' | 'createdAt'>;
