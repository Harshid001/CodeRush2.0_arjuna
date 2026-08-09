import { NextResponse } from 'next/server';
import type { DeepSeekIntentResponse, AgentApiRouteResponse } from '@/types/agent.types';

const SYSTEM_PROMPT = `You are an intent extraction assistant for an API marketplace.
Convert the user's natural language request into a valid JSON object ONLY.

RULES:
- Never explain your answer.
- Never return markdown formatting or extra commentary.
- Never select or recommend a provider.
- Never make payment or purchasing decisions.

SUPPORTED CATEGORIES (Choose strictly 1):
["OCR", "Translation", "Embeddings", "Speech-to-Text", "Text Generation", "Image Generation", "Moderation", "Risk Scoring", "Geocoding"]

SUPPORTED PRIORITIES (Choose strictly 1):
["Lowest Price", "Highest Quality", "Lowest Latency", "Highest Reliability", "Balanced"]

JSON SCHEMA:
{
  "category": "<one of supported categories>",
  "priority": "<one of supported priorities>",
  "budget": <numeric number in USD if specified e.g. 0.05, otherwise null>,
  "paymentType": "<'exact' or 'upto'>",
  "constraints": [<list of specific constraint keywords>]
}`;

async function callDeepSeekAPI(prompt: string, apiKey: string, baseUrl: string, model: string): Promise<DeepSeekIntentResponse> {
  const endpoint = `${baseUrl.replace(/\/$/, '')}/chat/completions`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    // If response_format error or custom endpoint mismatch, try without response_format flag
    const fallbackResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        temperature: 0.1,
      }),
    });

    if (!fallbackResponse.ok) {
      const errText = await fallbackResponse.text();
      throw new Error(`DeepSeek API returned HTTP ${fallbackResponse.status}: ${errText}`);
    }

    const data = await fallbackResponse.json();
    const content = data.choices?.[0]?.message?.content || '';
    return parseJsonContent(content);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';
  return parseJsonContent(content);
}

function parseJsonContent(content: string): DeepSeekIntentResponse {
  const clean = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const parsed = JSON.parse(clean);

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid JSON format returned by DeepSeek.');
  }

  return {
    category: parsed.category || 'General',
    priority: parsed.priority || 'Balanced',
    budget: typeof parsed.budget === 'number' ? parsed.budget : null,
    paymentType: parsed.paymentType === 'upto' ? 'upto' : 'exact',
    constraints: Array.isArray(parsed.constraints) ? parsed.constraints : [],
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt } = body || {};

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json<AgentApiRouteResponse>(
        { success: false, error: 'Prompt is required.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json<AgentApiRouteResponse>(
        { success: false, error: 'DeepSeek API key is not configured on the server.' },
        { status: 500 }
      );
    }
    const baseUrl = process.env.DEEPSEEK_BASE_URL || 'https://api.xkiro.com/v1';
    const model = process.env.DEEPSEEK_MODEL || 'deepseek/deepseek-v4-pro';

    let intent: DeepSeekIntentResponse;

    try {
      // Attempt 1 to DeepSeek
      intent = await callDeepSeekAPI(prompt, apiKey, baseUrl, model);
    } catch (firstErr) {
      console.warn('[DeepSeek Service] First attempt failed, retrying once...', firstErr);
      try {
        // Attempt 2 (Automatic Retry)
        intent = await callDeepSeekAPI(prompt, apiKey, baseUrl, model);
      } catch (secondErr) {
        console.error('[DeepSeek Service] Retry attempt failed:', secondErr);
        return NextResponse.json<AgentApiRouteResponse>(
          {
            success: false,
            error: 'Unable to understand your request via DeepSeek. Please try again.',
          },
          { status: 502 }
        );
      }
    }

    return NextResponse.json<AgentApiRouteResponse>({
      success: true,
      data: intent,
      source: 'deepseek',
    });
  } catch (error: any) {
    console.error('[Agent API Route Error]:', error);
    return NextResponse.json<AgentApiRouteResponse>(
      {
        success: false,
        error: error.message || 'An unexpected error occurred while parsing intent.',
      },
      { status: 500 }
    );
  }
}
