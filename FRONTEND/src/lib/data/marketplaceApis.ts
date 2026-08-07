export interface MarketplaceApi {
    id: string;
    icon: string;
    name: string;
    provider: string;
    rating: number;
    reviews: number;
    price: string;
    cap: string;
    desc: string;
    chain: string;
    cat: string;
    model: string;
    featured: boolean;
    qualityScore: number;
    rawDescription: string;

    // Extended fields mocking details that would be returned by GET /providers/:id
    network?: string;
    endpoint?: string;
    authType?: string;
    supportedMethods?: string[];
    latency?: number;
    reliability?: number;
    rateLimit?: number;
    tags?: string[];
    inputSchema?: string;
    outputSchema?: string;
}

export const apis: MarketplaceApi[] = [
    {
        id: 'gpt4-vision',
        icon: 'brain',
        name: 'GPT-4 Vision Pro',
        provider: 'OpenCore Labs',
        rating: 4.9,
        reviews: 2841,
        price: '$0.0042',
        cap: '10K req/mo',
        desc: 'State-of-the-art multimodal AI with unparalleled vision understanding for images, charts, and documents.',
        chain: 'Algorand TestNet',
        cat: 'Language Models',
        model: 'Pay-per-Request',
        featured: true,
        qualityScore: 98.4,
        rawDescription: "Multimodal vision model endpoint for text/image processing.",
        network: 'algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDy',
        endpoint: '/api/providers/gpt4-vision',
        authType: 'x402-avm',
        supportedMethods: ['POST'],
        latency: 180,
        reliability: 99.9,
        rateLimit: 1000,
        tags: ['vision', 'multimodal', 'nlp'],
        inputSchema: '{\n  "image_url": "string",\n  "prompt": "string"\n}',
        outputSchema: '{\n  "description": "string",\n  "objects": ["string"]\n}'
    },
    {
        id: 'whisper-stt',
        icon: 'mic',
        name: 'Whisper STT Ultra',
        provider: 'AudioAI Systems',
        rating: 4.8,
        reviews: 1204,
        price: '$0.0018',
        cap: '50K req/mo',
        desc: 'High-accuracy speech-to-text with 99+ languages, speaker diarization and real-time streaming support.',
        chain: 'Algorand TestNet',
        cat: 'Audio & Speech',
        model: 'Pay-per-Request',
        featured: false,
        qualityScore: 96.2,
        rawDescription: "High precision speech-to-text audio processing API.",
        network: 'algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDy',
        endpoint: '/api/providers/whisper-stt',
        authType: 'x402-avm',
        supportedMethods: ['POST'],
        latency: 85,
        reliability: 99.5,
        rateLimit: 500,
        tags: ['audio', 'stt', 'transcription'],
        inputSchema: '{\n  "audio_base64": "string",\n  "language": "string"\n}',
        outputSchema: '{\n  "transcript": "string",\n  "confidence": "number"\n}'
    },
    {
        id: 'stable-diff-xl',
        icon: 'eye',
        name: 'Stable Diffusion XL',
        provider: 'PixelForge AI',
        rating: 4.7,
        reviews: 3620,
        price: '$0.0065',
        cap: '5K req/mo',
        desc: 'Photorealistic image generation from text. Fine-tuned for commercial use with built-in safety layers.',
        chain: 'Algorand TestNet',
        cat: 'Computer Vision',
        model: 'Pay-per-Request',
        featured: true,
        qualityScore: 91.8,
        rawDescription: "Image generation model v2.1 with safety filters.",
        network: 'algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDy',
        endpoint: '/api/providers/stable-diff-xl',
        authType: 'x402-avm',
        supportedMethods: ['POST'],
        latency: 2200,
        reliability: 98.0,
        rateLimit: 50,
        tags: ['generation', 'vision', 'art'],
        inputSchema: '{\n  "prompt": "string",\n  "negative_prompt": "string",\n  "steps": "number"\n}',
        outputSchema: '{\n  "image_base64": "string"\n}'
    },
    {
        id: 'datastream-ml',
        icon: 'activity',
        name: 'DataStream ML',
        provider: 'NexusDB Corp',
        rating: 4.6,
        reviews: 892,
        price: '$0.0012',
        cap: '100K req/mo',
        desc: 'Real-time ML inference on streaming data — anomaly detection, forecasting, and classification at scale.',
        chain: 'Algorand TestNet',
        cat: 'Data & Analytics',
        model: 'Usage Cap',
        featured: false,
        qualityScore: 84.1,
        rawDescription: "Stream analytics and anomaly detection engine.",
        network: 'algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDy',
        endpoint: '/api/providers/datastream-ml',
        authType: 'x402-avm',
        supportedMethods: ['POST', 'GET'],
        latency: 45,
        reliability: 99.0,
        rateLimit: 5000,
        tags: ['data', 'analytics', 'streaming'],
        inputSchema: '{\n  "stream_id": "string",\n  "events": ["object"]\n}',
        outputSchema: '{\n  "anomalies": ["object"],\n  "forecast": "object"\n}'
    },
    {
        id: 'code-llama',
        icon: 'code',
        name: 'CodeLLaMA Pro',
        provider: 'MetaSynth AI',
        rating: 4.8,
        reviews: 1567,
        price: '$0.0028',
        cap: '20K req/mo',
        desc: 'Code generation, review, and debugging powered by the latest code-specialized large language model.',
        chain: 'Algorand TestNet',
        cat: 'Code & Dev',
        model: 'Pay-per-Request',
        featured: false,
        qualityScore: 97.5,
        rawDescription: "Code generation and review assistant.",
        network: 'algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDy',
        endpoint: '/api/providers/code-llama',
        authType: 'x402-avm',
        supportedMethods: ['POST'],
        latency: 350,
        reliability: 99.8,
        rateLimit: 800,
        tags: ['nlp', 'code', 'generation'],
        inputSchema: '{\n  "code_context": "string",\n  "instruction": "string"\n}',
        outputSchema: '{\n  "suggestion": "string"\n}'
    },
    {
        id: 'embed-v3',
        icon: 'database',
        name: 'EmbedForce v3',
        provider: 'VectorCore',
        rating: 4.9,
        reviews: 4102,
        price: '$0.0003',
        cap: '500K req/mo',
        desc: 'High-dimensional text and image embeddings optimized for semantic search and RAG applications.',
        chain: 'Algorand TestNet',
        cat: 'Embeddings',
        model: 'Freemium',
        featured: false,
        qualityScore: 99.1,
        rawDescription: "Vector embedding 1536 dim service.",
        network: 'algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDy',
        endpoint: '/api/providers/embed-v3',
        authType: 'x402-avm',
        supportedMethods: ['POST'],
        latency: 25,
        reliability: 99.99,
        rateLimit: 10000,
        tags: ['vector', 'embedding', 'rag'],
        inputSchema: '{\n  "text": "string"\n}',
        outputSchema: '{\n  "vector": ["number"]\n}'
    },
    {
        id: 'claude-inference',
        icon: 'brain',
        name: 'Claude Inference API',
        provider: 'Anthropos Cloud',
        rating: 4.9,
        reviews: 2100,
        price: '$0.0055',
        cap: '8K req/mo',
        desc: 'Constitutional AI with superior reasoning, 200K context window, and industry-leading safety.',
        chain: 'Algorand TestNet',
        cat: 'Language Models',
        model: 'Pay-per-Request',
        featured: true,
        qualityScore: 98.9,
        rawDescription: "Constitutional LLM pipeline for deep reasoning tasks.",
        network: 'algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDy',
        endpoint: '/api/providers/claude-inference',
        authType: 'x402-avm',
        supportedMethods: ['POST'],
        latency: 410,
        reliability: 99.9,
        rateLimit: 500,
        tags: ['nlp', 'conversational', 'safety'],
        inputSchema: '{\n  "messages": ["object"],\n  "system": "string"\n}',
        outputSchema: '{\n  "response": "string"\n}'
    },
    {
        id: 'vision-ocr',
        icon: 'eye',
        name: 'VisionOCR Enterprise',
        provider: 'DocuScan AI',
        rating: 4.7,
        reviews: 778,
        price: '$0.0022',
        cap: '25K req/mo',
        desc: 'Document intelligence: OCR, table extraction, form parsing, and structure recognition at enterprise scale.',
        chain: 'Algorand TestNet',
        cat: 'Computer Vision',
        model: 'Usage Cap',
        featured: false,
        qualityScore: 89.4,
        rawDescription: "OCR extraction API for document understanding.",
        network: 'algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDy',
        endpoint: '/api/providers/vision-ocr',
        authType: 'x402-avm',
        supportedMethods: ['POST'],
        latency: 550,
        reliability: 98.5,
        rateLimit: 300,
        tags: ['ocr', 'vision', 'document'],
        inputSchema: '{\n  "document_base64": "string"\n}',
        outputSchema: '{\n  "text": "string",\n  "tables": ["object"]\n}'
    },
    {
        id: 'translate-global',
        icon: 'globe',
        name: 'TranslateGlobal API',
        provider: 'LinguaAI',
        rating: 4.6,
        reviews: 1340,
        price: '$0.0008',
        cap: '200K req/mo',
        desc: '200+ languages with dialect support, domain-specific terminology, and real-time streaming translation.',
        chain: 'Algorand TestNet',
        cat: 'Language Models',
        model: 'Pay-per-Request',
        featured: false,
        qualityScore: 95.0,
        rawDescription: "Translation microservice for multi-language conversion.",
        network: 'algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDy',
        endpoint: '/api/providers/translate-global',
        authType: 'x402-avm',
        supportedMethods: ['POST'],
        latency: 120,
        reliability: 99.7,
        rateLimit: 2000,
        tags: ['translation', 'nlp', 'streaming'],
        inputSchema: '{\n  "text": "string",\n  "target_lang": "string"\n}',
        outputSchema: '{\n  "translated_text": "string"\n}'
    }
];

export const getProviderById = async (id: string): Promise<MarketplaceApi | null> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const provider = apis.find(p => p.id === id);
            resolve(provider || null);
        }, 200);
    });
};
