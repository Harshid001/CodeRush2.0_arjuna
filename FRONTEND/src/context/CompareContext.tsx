'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { MarketplaceApi } from '@/lib/data/marketplaceApis';

const MAX_COMPARE = 3;
const STORAGE_KEY = 'x402_compare_list';

interface CompareContextType {
    compareList: MarketplaceApi[];
    addToCompare: (api: MarketplaceApi) => boolean;
    removeFromCompare: (id: string) => void;
    clearCompare: () => void;
    isInCompare: (id: string) => boolean;
    count: number;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: ReactNode }) {
    const [compareList, setCompareList] = useState<MarketplaceApi[]>([]);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            const saved = sessionStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    const validList = parsed.filter(item => item && typeof item.id === 'string' && typeof item.name === 'string');
                    setCompareList(validList.slice(0, MAX_COMPARE));
                }
            }
        } catch (e) {
            console.warn('[CompareContext] Failed to parse compare list from sessionStorage:', e);
        } finally {
            setInitialized(true);
        }
    }, []);

    useEffect(() => {
        if (!initialized || typeof window === 'undefined') return;
        try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(compareList));
        } catch (e) {
            console.warn('[CompareContext] Failed to persist compare list to sessionStorage:', e);
        }
    }, [compareList, initialized]);

    const addToCompare = useCallback((api: MarketplaceApi): boolean => {
        if (!api || !api.id || typeof api.name !== 'string') return false;

        let added = false;
        setCompareList(prev => {
            if (prev.length >= MAX_COMPARE) return prev;
            if (prev.some(p => p.id === api.id)) return prev;
            added = true;
            return [...prev, api];
        });
        return added;
    }, []);

    const removeFromCompare = useCallback((id: string) => {
        setCompareList(prev => prev.filter(p => p.id !== id));
    }, []);

    const clearCompare = useCallback(() => {
        setCompareList([]);
    }, []);

    const isInCompare = useCallback((id: string) => {
        return compareList.some(p => p.id === id);
    }, [compareList]);

    return (
        <CompareContext.Provider value={{
            compareList,
            addToCompare,
            removeFromCompare,
            clearCompare,
            isInCompare,
            count: compareList.length,
        }}>
            {children}
        </CompareContext.Provider>
    );
}

export function useCompare() {
    const ctx = useContext(CompareContext);
    if (!ctx) throw new Error('useCompare must be used within CompareProvider');
    return ctx;
}
