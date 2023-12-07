import { WalletId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1alpha1/keys_pb';
import { localExtStorage } from '@penumbra-zone/storage';
import { uint8ArrayToString } from '@penumbra-zone/types';

// If wallet id passed in req, ensure it's in storage
export async function assertWalletIdMatches(walletId: WalletId | undefined) {
  const wallets = await localExtStorage.get('wallets');
  if (
    walletId?.inner &&
    !wallets.find(wallet => wallet.id === uint8ArrayToString(walletId.inner))
  ) {
    throw new Error('walletId does not match walletIds in storage');
  }
}
