'use client';

import React, { createContext, useContext, useState } from 'react';

export type ProviderHealth = 'healthy' | 'down';

interface ProviderStatusContextType {
  providerStatus: Record<string, ProviderHealth>;
  setProviderStatus: (provider: string, status: ProviderHealth) => void;
  toggleProviderStatus: (provider: string) => void;
  isProviderDown: (provider: string) => boolean;
}

const DEFAULT_PROVIDERS: Record<string, ProviderHealth> = {
  'OpenCore Labs': 'healthy',
  'AudioAI Systems': 'healthy',
  'PixelForge AI': 'healthy',
  'VectorCore': 'healthy',
};

const ProviderStatusContext = createContext<ProviderStatusContextType | undefined>(undefined);

export function ProviderStatusProvider({ children }: { children: React.ReactNode }) {
  const [providerStatus, setStatusMap] = useState<Record<string, ProviderHealth>>(DEFAULT_PROVIDERS);

  const setProviderStatus = (provider: string, status: ProviderHealth) => {
    setStatusMap((prev) => ({
      ...prev,
      [provider]: status,
    }));
  };

  const toggleProviderStatus = (provider: string) => {
    setStatusMap((prev) => ({
      ...prev,
      [provider]: prev[provider] === 'down' ? 'healthy' : 'down',
    }));
  };

  const isProviderDown = (provider: string) => {
    return providerStatus[provider] === 'down';
  };

  return (
    <ProviderStatusContext.Provider
      value={{
        providerStatus,
        setProviderStatus,
        toggleProviderStatus,
        isProviderDown,
      }}
    >
      {children}
    </ProviderStatusContext.Provider>
  );
}

export function useProviderStatus() {
  const context = useContext(ProviderStatusContext);
  if (!context) {
    throw new Error('useProviderStatus must be used within a ProviderStatusProvider');
  }
  return context;
}
