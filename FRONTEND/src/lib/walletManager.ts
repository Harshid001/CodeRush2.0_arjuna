import { WalletManager, WalletId, NetworkId } from '@txnlab/use-wallet-react';

export const walletManager = new WalletManager({
  wallets: [WalletId.LUTE],
  defaultNetwork: NetworkId.TESTNET,
});
