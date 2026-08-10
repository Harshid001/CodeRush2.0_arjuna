import { WalletManager, WalletId, NetworkId } from '@txnlab/use-wallet-react';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '3a8170812b534d0ff9d794f19a901d64';

export const walletManager = new WalletManager({
  wallets: [
    WalletId.LUTE,
    WalletId.PERA,
    WalletId.DEFLY,
    WalletId.KIBISIS,
    WalletId.EXODUS,
    {
      id: WalletId.WALLETCONNECT,
      options: { projectId },
    },
  ],
  defaultNetwork: NetworkId.TESTNET,
});

