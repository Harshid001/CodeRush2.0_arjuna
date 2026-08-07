import { useState, useEffect, useCallback } from 'react';

export interface AlgorandBalanceResult {
  algoBalance: number;
  usdcBalance: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const USDC_ASA_ID = 10458941;
const INDEXER_URL = 'https://testnet-idx.algonode.cloud/v2/accounts';
const REFRESH_INTERVAL_MS = 15000; // 15 seconds

export function useAlgorandBalance(address: string | null | undefined): AlgorandBalanceResult {
  const [algoBalance, setAlgoBalance] = useState<number>(0);
  const [usdcBalance, setUsdcBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!address) {
      setAlgoBalance(0);
      setUsdcBalance(0);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${INDEXER_URL}/${address}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          // New/unfunded account on TestNet
          setAlgoBalance(0);
          setUsdcBalance(0);
          setIsLoading(false);
          setError(null);
          return;
        }
        throw new Error(`Indexer responded with status ${response.status}`);
      }

      const data = await response.json();
      const account = data.account;

      if (account) {
        // ALGO balance (microAlgos to ALGO, 6 decimals)
        const rawMicroAlgos = account.amount || 0;
        const algo = rawMicroAlgos / 1_000_000;

        // USDC balance (ASA ID: 10458941, 6 decimals)
        let usdc = 0;
        if (Array.isArray(account.assets)) {
          const usdcAsset = account.assets.find(
            (asset: { 'asset-id': number; amount: number }) => asset['asset-id'] === USDC_ASA_ID
          );
          if (usdcAsset && typeof usdcAsset.amount === 'number') {
            usdc = usdcAsset.amount / 1_000_000;
          }
        }

        setAlgoBalance(algo);
        setUsdcBalance(usdc);
        setError(null);
      }
    } catch (err: any) {
      console.warn('Algorand TestNet balance fetch error:', err);
      setError(err?.message || 'Balance unavailable');
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchBalance();

    if (!address) return;

    const intervalId = setInterval(() => {
      fetchBalance();
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [address, fetchBalance]);

  return {
    algoBalance,
    usdcBalance,
    isLoading,
    error,
    refetch: fetchBalance,
  };
}
