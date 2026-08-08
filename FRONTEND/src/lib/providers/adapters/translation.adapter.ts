import { Provider } from '@/lib/x402/types';
import { ProviderAdapter, ProviderExecutionResult } from '../ProviderAdapter';

const TRANSLATION_MAP: Record<string, Record<string, string>> = {
  hindi: {
    "hello world": "नमस्ते दुनिया",
    "hello": "नमस्ते",
    "welcome": "स्वागत है",
    "thank you": "धन्यवाद",
    "good morning": "शुभ प्रभात"
  },
  spanish: {
    "hello world": "Hola Mundo",
    "hello": "Hola",
    "welcome": "Bienvenido",
    "thank you": "Gracias",
    "good morning": "Buenos días"
  },
  french: {
    "hello world": "Bonjour le monde",
    "hello": "Bonjour",
    "welcome": "Bienvenue",
    "thank you": "Merci",
    "good morning": "Bonjoir"
  },
  german: {
    "hello world": "Hallo Welt",
    "hello": "Hallo",
    "welcome": "Willkommen",
    "thank you": "Danke",
    "good morning": "Guten Morgen"
  },
  japanese: {
    "hello world": "こんにちは世界",
    "hello": "こんにちは",
    "welcome": "ようこそ",
    "thank you": "ありがとう",
    "good morning": "おはようございます"
  }
};

export class TranslationAdapter implements ProviderAdapter {
  async execute(input: string, provider: Provider): Promise<ProviderExecutionResult> {
    // Attempt to extract source text and target language from prompt
    // e.g. "Translate 'Hello World' into Hindi"
    let targetLanguage = 'Hindi';
    let originalText = 'Hello World';

    const cleanInput = input.toLowerCase();
    
    // Simple regex matching for language and text
    const langMatch = cleanInput.match(/to|into\s+(hindi|spanish|french|german|japanese|english)/i);
    if (langMatch) {
      targetLanguage = langMatch[1].charAt(0).toUpperCase() + langMatch[1].slice(1).toLowerCase();
    }

    const quotesMatch = input.match(/['"](.*?)['"]/);
    if (quotesMatch) {
      originalText = quotesMatch[1];
    } else {
      // remove verbs like "translate"
      originalText = input
        .replace(/translate/i, '')
        .replace(/to\s+\w+/i, '')
        .replace(/into\s+\w+/i, '')
        .trim();
      if (!originalText) {
        originalText = 'Hello World';
      }
    }

    const dictKey = originalText.toLowerCase().trim();
    const langKey = targetLanguage.toLowerCase().trim();
    
    let translated = `[Simulated Translation into ${targetLanguage}]: ${originalText}`;
    if (TRANSLATION_MAP[langKey] && TRANSLATION_MAP[langKey][dictKey]) {
      translated = TRANSLATION_MAP[langKey][dictKey];
    } else if (langKey === 'english' && TRANSLATION_MAP['hindi'][dictKey]) {
      // reverse translation simple case
      translated = "Hello World";
    }

    const result = {
      original: originalText,
      translated,
      targetLanguage,
      confidence: 0.97
    };

    return {
      success: true,
      providerId: provider.id,
      providerName: provider.name,
      category: 'Translation',
      result,
      latency: Math.floor(60 + Math.random() * 50),
      usage: {
        promptTokens: Math.floor(originalText.length / 4) + 5,
        completionTokens: Math.floor(translated.length / 4) + 5,
        totalTokens: Math.floor(originalText.length / 4) + Math.floor(translated.length / 4) + 10,
        unit: 'token'
      },
      cost: provider.price,
      isSimulated: true
    };
  }
}
