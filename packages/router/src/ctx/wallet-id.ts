import { localExtStorage } from '@penumbra-zone/storage';

import { stringToUint8Array } from '@penumbra-zone/types';

import { WalletId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1alpha1/keys_pb';

export const assertWalletId = async (walletId?: WalletId) => {
  const localWalletIds = (await localExtStorage.get('wallets')).map(
    wallet => new WalletId({ inner: stringToUint8Array(wallet.id) }),
  );
  const hasWallet = localWalletIds.find(localWallet => localWallet.equals(walletId));
  if (!hasWallet) throw new Error('walletId unknown');
  return true;
};
