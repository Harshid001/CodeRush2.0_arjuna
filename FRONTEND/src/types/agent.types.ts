/**
 * AGENT TYPES & DEEPSEEK INTENT INTERFACES
 */

export type AgentCategory =
  | 'OCR'
  | 'Translation'
  | 'Embeddings'
  | 'Speech-to-Text'
  | 'Text Generation'
  | 'Image Generation'
  | 'Moderation'
  | 'Risk Scoring'
  | 'Geocoding'
  | 'General';

export type AgentPriority =
  | 'Lowest Price'
  | 'Highest Quality'
  | 'Lowest Latency'
  | 'Highest Reliability'
  | 'Balanced';

export interface DeepSeekIntentResponse {
  category: string;
  priority: string;
  budget?: number | null;
  paymentType?: 'exact' | 'upto';
  constraints?: string[];
}

export interface AgentApiRouteRequest {
  prompt: string;
}

export interface AgentApiRouteResponse {
  success: boolean;
  data?: DeepSeekIntentResponse;
  source?: 'deepseek' | 'fallback';
  error?: string;
}
