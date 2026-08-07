'use client';

import React, { useCallback } from 'react';
import { useForm, UseFormWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Send, Plus, X, Sparkles } from 'lucide-react';

import Input from '@/components/ui/input';
import Label from '@/components/ui/label';
import Textarea from '@/components/ui/textarea';
import Select from '@/components/ui/select';
import Checkbox from '@/components/ui/checkbox';
import type { Provider, ProviderFormData } from '@/types/provider';

/* ─── Zod schema ─── */
const providerSchema = z.object({
    providerName: z.string().min(1, 'Provider name is required'),
    companyName: z.string().min(1, 'Company name is required'),
    logoUrl: z.string().url('Must be a valid URL').or(z.literal('')),
    website: z.string().url('Must be a valid URL'),
    email: z.string().email('Must be a valid email address'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    category: z.string().min(1, 'Category is required'),
    apiEndpoint: z.string().url('Must be a valid URL'),
    version: z.string().min(1, 'Version is required'),
    network: z.string().min(1, 'Network is required'),
    paymentType: z.enum(['exact', 'upto']),
    pricePerRequest: z.coerce.number().positive('Price must be greater than 0'),
    avgLatency: z.coerce.number().positive('Latency must be greater than 0'),
    qualityScore: z.coerce.number().min(0, 'Min 0').max(100, 'Max 100'),
    reliability: z.coerce.number().min(0, 'Min 0').max(100, 'Max 100'),
    rateLimit: z.coerce.number().int().positive('Must be a positive integer'),
    authType: z.string().min(1, 'Auth type is required'),
    supportedMethods: z.array(z.string()).min(1, 'At least one method required'),
    inputSchema: z.string().min(1, 'Input schema is required').refine(
        (val) => { try { JSON.parse(val); return true; } catch { return false; } },
        'Must be valid JSON'
    ),
    outputSchema: z.string().min(1, 'Output schema is required').refine(
        (val) => { try { JSON.parse(val); return true; } catch { return false; } },
        'Must be valid JSON'
    ),
    tags: z.array(z.string()),
    termsAccepted: z.literal(true, { errorMap: () => ({ message: 'You must accept the terms' }) }),
});

type FormValues = z.infer<typeof providerSchema>;

/* ─── Constants ─── */
const CATEGORIES = [
    { value: 'LLM & NLP', label: 'LLM & NLP' },
    { value: 'Computer Vision', label: 'Computer Vision' },
    { value: 'Financial & Market Data', label: 'Financial & Market Data' },
    { value: 'Code & DevTools', label: 'Code & DevTools' },
    { value: 'Audio & Speech', label: 'Audio & Speech' },
    { value: 'Data & Analytics', label: 'Data & Analytics' },
    { value: 'Web Scraping', label: 'Web Scraping' },
];

const NETWORKS = [
    { value: 'base-sepolia', label: 'Base Sepolia' },
    { value: 'arbitrum-sepolia', label: 'Arbitrum Sepolia' },
    { value: 'optimism-sepolia', label: 'Optimism Sepolia' },
    { value: 'ethereum', label: 'Ethereum' },
    { value: 'polygon', label: 'Polygon' },
    { value: 'solana', label: 'Solana' },
];

const AUTH_TYPES = [
    { value: 'api-key', label: 'API Key' },
    { value: 'bearer', label: 'Bearer Token' },
    { value: 'oauth2', label: 'OAuth 2.0' },
    { value: 'none', label: 'No Authentication' },
];

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

/* ─── Styles ─── */
const sectionStyle: React.CSSProperties = {
    padding: '24px',
    borderRadius: 16,
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    marginBottom: 20,
};

const sectionTitleStyle: React.CSSProperties = {
    fontFamily: 'Inter, sans-serif',
    fontSize: 14,
    fontWeight: 600,
    color: '#ccc',
    marginBottom: 18,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
};

const gridStyle = (cols: number): React.CSSProperties => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gap: 16,
});

/* ─── Component ─── */
interface ProviderRegistrationFormProps {
    onSubmit: (provider: Provider) => void;
    onWatch?: (watch: UseFormWatch<FormValues>) => void;
    renderPreview?: (values: FormValues) => React.ReactNode;
}

export default function ProviderRegistrationForm({
    onSubmit,
    renderPreview,
}: ProviderRegistrationFormProps) {
    const {
        register,
        handleSubmit,
        watch,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(providerSchema),
        defaultValues: {
            providerName: '',
            companyName: '',
            logoUrl: '',
            website: '',
            email: '',
            description: '',
            category: 'LLM & NLP',
            apiEndpoint: '',
            version: '1.0.0',
            network: 'base-sepolia',
            paymentType: 'exact',
            pricePerRequest: 0.01,
            avgLatency: 100,
            qualityScore: 90,
            reliability: 95,
            rateLimit: 1000,
            authType: 'api-key',
            supportedMethods: ['POST'],
            inputSchema: '{\n  "prompt": "string"\n}',
            outputSchema: '{\n  "result": "string",\n  "confidence": "number"\n}',
            tags: [],
            termsAccepted: false as unknown as true,
        },
    });

    const watchedValues = watch();

    /* ─── Tag management ─── */
    const [tagInput, setTagInput] = React.useState('');
    const currentTags = watch('tags');

    const addTag = useCallback(() => {
        const trimmed = tagInput.trim();
        if (trimmed && !currentTags.includes(trimmed)) {
            setValue('tags', [...currentTags, trimmed]);
            setTagInput('');
        }
    }, [tagInput, currentTags, setValue]);

    const removeTag = (tag: string) => {
        setValue('tags', currentTags.filter((t) => t !== tag));
    };

    /* ─── Method toggle ─── */
    const currentMethods = watch('supportedMethods');
    const toggleMethod = (method: string) => {
        if (currentMethods.includes(method)) {
            setValue('supportedMethods', currentMethods.filter((m) => m !== method));
        } else {
            setValue('supportedMethods', [...currentMethods, method]);
        }
    };

    /* ─── Submit handler (swap-ready for API call) ─── */
    const handleCreateProvider = useCallback(
        async (data: FormValues) => {
            const provider: Provider = {
                ...data,
                id: `p_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`,
                createdAt: new Date().toISOString(),
            };

            // ── Currently: local state ──
            // To switch to API: replace the line below with:
            // await fetch('/api/providers', { method: 'POST', body: JSON.stringify(provider), headers: { 'Content-Type': 'application/json' } });
            onSubmit(provider);

            toast.success('Provider registered successfully!', {
                description: `${data.providerName} is now live on the marketplace.`,
            });
            reset();
        },
        [onSubmit, reset]
    );

    return (
        <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>
            {/* ── Form Column ── */}
            <form
                onSubmit={handleSubmit(handleCreateProvider)}
                style={{ flex: '1 1 0%', minWidth: 0 }}
            >
                {/* Section 1: Basic Info */}
                <div style={sectionStyle}>
                    <h3 style={sectionTitleStyle}>
                        <Sparkles size={15} color="#666" /> Basic Information
                    </h3>
                    <div style={gridStyle(2)}>
                        <div>
                            <Label required>Provider Name</Label>
                            <Input
                                {...register('providerName')}
                                placeholder="e.g. GPT-4 Vision Pro"
                                error={errors.providerName?.message}
                            />
                        </div>
                        <div>
                            <Label required>Company Name</Label>
                            <Input
                                {...register('companyName')}
                                placeholder="e.g. OpenCore Labs"
                                error={errors.companyName?.message}
                            />
                        </div>
                    </div>
                    <div style={{ ...gridStyle(2), marginTop: 16 }}>
                        <div>
                            <Label required>Email</Label>
                            <Input
                                {...register('email')}
                                type="email"
                                placeholder="team@company.com"
                                error={errors.email?.message}
                            />
                        </div>
                        <div>
                            <Label required>Website</Label>
                            <Input
                                {...register('website')}
                                placeholder="https://company.com"
                                error={errors.website?.message}
                            />
                        </div>
                    </div>
                    <div style={{ marginTop: 16 }}>
                        <Label>Logo URL</Label>
                        <Input
                            {...register('logoUrl')}
                            placeholder="https://company.com/logo.png (optional)"
                            error={errors.logoUrl?.message}
                        />
                    </div>
                    <div style={{ marginTop: 16 }}>
                        <Label required>Description</Label>
                        <Textarea
                            {...register('description')}
                            placeholder="Describe your API capabilities, accuracy, and supported data inputs..."
                            error={errors.description?.message}
                        />
                    </div>
                    <div style={{ ...gridStyle(2), marginTop: 16 }}>
                        <div>
                            <Label required>Category</Label>
                            <Select
                                {...register('category')}
                                options={CATEGORIES}
                                error={errors.category?.message}
                            />
                        </div>
                        <div>
                            <Label required>Version</Label>
                            <Input
                                {...register('version')}
                                placeholder="1.0.0"
                                error={errors.version?.message}
                            />
                        </div>
                    </div>
                </div>

                {/* Section 2: API Details */}
                <div style={sectionStyle}>
                    <h3 style={sectionTitleStyle}>
                        <Sparkles size={15} color="#666" /> API Configuration
                    </h3>
                    <div>
                        <Label required>API Endpoint</Label>
                        <Input
                            {...register('apiEndpoint')}
                            placeholder="https://api.your-service.com/v1/inference"
                            error={errors.apiEndpoint?.message}
                        />
                    </div>
                    <div style={{ ...gridStyle(2), marginTop: 16 }}>
                        <div>
                            <Label required>Network</Label>
                            <Select
                                {...register('network')}
                                options={NETWORKS}
                                error={errors.network?.message}
                            />
                        </div>
                        <div>
                            <Label required>Auth Type</Label>
                            <Select
                                {...register('authType')}
                                options={AUTH_TYPES}
                                error={errors.authType?.message}
                            />
                        </div>
                    </div>

                    {/* HTTP Methods */}
                    <div style={{ marginTop: 16 }}>
                        <Label required>Supported Methods</Label>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {HTTP_METHODS.map((method) => {
                                const isActive = currentMethods.includes(method);
                                return (
                                    <button
                                        key={method}
                                        type="button"
                                        onClick={() => toggleMethod(method)}
                                        style={{
                                            padding: '6px 14px',
                                            borderRadius: 8,
                                            border: `1px solid ${isActive ? 'rgba(90,154,90,0.5)' : 'rgba(255,255,255,0.08)'}`,
                                            background: isActive ? 'rgba(90,154,90,0.15)' : 'rgba(255,255,255,0.03)',
                                            color: isActive ? '#7dba7d' : '#666',
                                            fontFamily: 'Inter, sans-serif',
                                            fontSize: 12,
                                            fontWeight: 500,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        {method}
                                    </button>
                                );
                            })}
                        </div>
                        {errors.supportedMethods && (
                            <p style={{ color: '#ef4444', fontSize: 11, marginTop: 4, fontFamily: 'Inter' }}>
                                {errors.supportedMethods.message}
                            </p>
                        )}
                    </div>
                </div>

                {/* Section 3: Performance & Pricing */}
                <div style={sectionStyle}>
                    <h3 style={sectionTitleStyle}>
                        <Sparkles size={15} color="#666" /> Performance & Pricing
                    </h3>
                    <div style={gridStyle(2)}>
                        <div>
                            <Label required>Payment Type</Label>
                            <Select
                                {...register('paymentType')}
                                options={[
                                    { value: 'exact', label: 'Exact (Fixed Price)' },
                                    { value: 'upto', label: 'Up To (Metered Cap)' },
                                ]}
                                error={errors.paymentType?.message}
                            />
                        </div>
                        <div>
                            <Label required>Price per Request ($)</Label>
                            <Input
                                {...register('pricePerRequest')}
                                type="number"
                                step="0.001"
                                placeholder="0.01"
                                error={errors.pricePerRequest?.message}
                            />
                        </div>
                    </div>
                    <div style={{ ...gridStyle(2), marginTop: 16 }}>
                        <div>
                            <Label required>Avg Latency (ms)</Label>
                            <Input
                                {...register('avgLatency')}
                                type="number"
                                placeholder="100"
                                error={errors.avgLatency?.message}
                            />
                        </div>
                        <div>
                            <Label required>Rate Limit (req/min)</Label>
                            <Input
                                {...register('rateLimit')}
                                type="number"
                                placeholder="1000"
                                error={errors.rateLimit?.message}
                            />
                        </div>
                    </div>
                    <div style={{ ...gridStyle(2), marginTop: 16 }}>
                        <div>
                            <Label required>Quality Score (0-100)</Label>
                            <Input
                                {...register('qualityScore')}
                                type="number"
                                min="0"
                                max="100"
                                error={errors.qualityScore?.message}
                            />
                        </div>
                        <div>
                            <Label required>Reliability (0-100%)</Label>
                            <Input
                                {...register('reliability')}
                                type="number"
                                min="0"
                                max="100"
                                error={errors.reliability?.message}
                            />
                        </div>
                    </div>
                </div>

                {/* Section 4: Schemas */}
                <div style={sectionStyle}>
                    <h3 style={sectionTitleStyle}>
                        <Sparkles size={15} color="#666" /> Request / Response Schema
                    </h3>
                    <div style={gridStyle(2)}>
                        <div>
                            <Label required>Input Schema (JSON)</Label>
                            <Textarea
                                {...register('inputSchema')}
                                placeholder='{ "prompt": "string" }'
                                error={errors.inputSchema?.message}
                                style={{ fontFamily: 'monospace', fontSize: 12 }}
                            />
                        </div>
                        <div>
                            <Label required>Output Schema (JSON)</Label>
                            <Textarea
                                {...register('outputSchema')}
                                placeholder='{ "result": "string" }'
                                error={errors.outputSchema?.message}
                                style={{ fontFamily: 'monospace', fontSize: 12 }}
                            />
                        </div>
                    </div>
                </div>

                {/* Section 5: Tags */}
                <div style={sectionStyle}>
                    <h3 style={sectionTitleStyle}>
                        <Sparkles size={15} color="#666" /> Tags
                    </h3>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <div style={{ flex: 1 }}>
                            <Input
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                placeholder="Add a tag..."
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addTag();
                                    }
                                }}
                            />
                        </div>
                        <button
                            type="button"
                            onClick={addTag}
                            style={{
                                padding: '10px 16px',
                                borderRadius: 12,
                                border: '1px solid rgba(255,255,255,0.08)',
                                background: 'rgba(255,255,255,0.05)',
                                color: '#888',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 5,
                                fontFamily: 'Inter',
                                fontSize: 12,
                            }}
                        >
                            <Plus size={14} /> Add
                        </button>
                    </div>
                    {currentTags.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                            {currentTags.map((tag) => (
                                <span
                                    key={tag}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        padding: '4px 12px',
                                        borderRadius: 100,
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        color: '#999',
                                        fontFamily: 'Inter',
                                        fontSize: 11,
                                    }}
                                >
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={() => removeTag(tag)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#666',
                                            cursor: 'pointer',
                                            padding: 0,
                                            display: 'flex',
                                        }}
                                    >
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Section 6: Terms */}
                <div style={sectionStyle}>
                    <Checkbox
                        {...register('termsAccepted')}
                        label="I agree to the Marketplace Terms of Service, Code of Conduct, and confirm that my API endpoint is production-ready and compliant with applicable regulations."
                        error={errors.termsAccepted?.message}
                    />
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                        width: '100%',
                        padding: '14px 32px',
                        borderRadius: 14,
                        border: '1px solid rgba(255,255,255,0.12)',
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.04) 100%)',
                        color: '#e0e0e0',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 600,
                        fontSize: 14,
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        opacity: isSubmitting ? 0.6 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 10,
                        transition: 'all 0.25s ease',
                    }}
                    onMouseEnter={(e) => {
                        if (!isSubmitting) {
                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.08) 100%)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 12px 40px rgba(200,210,255,0.08)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.04) 100%)';
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = 'none';
                    }}
                >
                    <Send size={16} />
                    {isSubmitting ? 'Publishing...' : 'Publish Provider to Marketplace'}
                </button>
            </form>

            {/* ── Preview Column (Desktop) ── */}
            {renderPreview && (
                <div
                    style={{
                        flex: '0 0 380px',
                        position: 'sticky',
                        top: 100,
                        alignSelf: 'flex-start',
                    }}
                    className="provider-preview-desktop"
                >
                    {renderPreview(watchedValues)}
                </div>
            )}
        </div>
    );
}
