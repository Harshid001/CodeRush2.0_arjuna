'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { MarketplaceApi } from '@/lib/data/marketplaceApis';

const MAX_COMPARE = 3;

interface CompareContextType {
    compareList: MarketplaceApi[];
    addToCompare: (api: MarketplaceApi) => boolean; // returns false if already 3
    removeFromCompare: (id: string) => void;
    clearCompare: () => void;
    isInCompare: (id: string) => boolean;
    count: number;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: ReactNode }) {
    const [compareList, setCompareList] = useState<MarketplaceApi[]>([]);

    const addToCompare = useCallback((api: MarketplaceApi): boolean => {
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
