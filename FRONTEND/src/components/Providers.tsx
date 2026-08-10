'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WalletProvider } from '@txnlab/use-wallet-react';
import { walletManager } from '@/lib/walletManager';
import { CompareProvider } from '@/context/CompareContext';

import { ReceiptProvider } from '@/lib/receiptStore';
import { ProviderStatusProvider } from '@/lib/providerStatus';
import { ProviderProvider } from '@/context/ProviderContext';
import { PaymentProvider } from '@/context/PaymentContext';

import { AuthProvider } from '@/context/AuthContext';

import { WagmiProvider } from 'wagmi';
import { wagmiConfig } from '@/lib/wagmi';

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
    <AuthProvider>
      <WagmiProvider config={wagmiConfig}>
        <WalletProvider manager={walletManager}>
          <QueryClientProvider client={queryClient}>
            <ProviderStatusProvider>
              <ReceiptProvider>
                <ProviderProvider>
                  <PaymentProvider>
                    <CompareProvider>
                      {children}
                    </CompareProvider>
                  </PaymentProvider>
                </ProviderProvider>
              </ReceiptProvider>
            </ProviderStatusProvider>
          </QueryClientProvider>
        </WalletProvider>
      </WagmiProvider>
    </AuthProvider>
  );
}
