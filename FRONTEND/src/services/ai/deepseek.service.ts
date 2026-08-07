import type { DeepSeekIntentResponse, AgentApiRouteResponse } from '@/types/agent.types';

export class DeepSeekService {
  /**
   * Sends user prompt to the server-side Next.js API route (/api/agent)
   * which securely calls DeepSeek using DEEPSEEK_API_KEY from process.env.
   */
  public async parseIntent(prompt: string): Promise<DeepSeekIntentResponse> {
    const response = await fetch('/api/agent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errData: AgentApiRouteResponse = await response.json().catch(() => ({ success: false }));
      throw new Error(errData.error || `Server returned HTTP ${response.status}`);
    }

    const resData: AgentApiRouteResponse = await response.json();

    if (!resData.success || !resData.data) {
      throw new Error(resData.error || 'Failed to extract intent using DeepSeek.');
    }

    return resData.data;
  }
}

export const deepSeekService = new DeepSeekService();
