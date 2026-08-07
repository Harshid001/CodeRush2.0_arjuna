'use client';

import React, { useState } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '@/lib/wagmi';

import { ReceiptProvider } from '@/lib/receiptStore';
import { ProviderStatusProvider } from '@/lib/providerStatus';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 60 * 1000,
          },
        },
      })
  );

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ProviderStatusProvider>
          <ReceiptProvider>
            {children}
          </ReceiptProvider>
        </ProviderStatusProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
