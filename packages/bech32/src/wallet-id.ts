import { bech32m } from 'bech32';
import {
  PENUMBRA_BECH32_WALLET_ID_LENGTH,
  PENUMBRA_BECH32_WALLET_ID_PREFIX,
} from './penumbra-bech32';
import { WalletId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';

export const bech32WalletId = (walletId: WalletId): string =>
  bech32m.encode(PENUMBRA_BECH32_WALLET_ID_PREFIX, bech32m.toWords(walletId.inner));

export const bech32ToWalletId = (walletId: string): WalletId => {
  const decodeAddress = bech32m.decode(walletId, PENUMBRA_BECH32_WALLET_ID_LENGTH);
  return new WalletId({ inner: new Uint8Array(bech32m.fromWords(decodeAddress.words)) });
};
