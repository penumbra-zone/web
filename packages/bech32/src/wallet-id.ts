import { bech32m } from 'bech32';
import {
  PENUMBRA_BECH32_WALLET_ID_LENGTH,
  PENUMBRA_BECH32_WALLET_ID_PREFIX,
} from './penumbra-bech32';

export const bech32WalletId = (walletId: { inner: Uint8Array }): string =>
  bech32m.encode(PENUMBRA_BECH32_WALLET_ID_PREFIX, bech32m.toWords(walletId.inner));

export const bech32ToWalletId = (walletId: string) => {
  const decodeAddress = bech32m.decode(walletId, PENUMBRA_BECH32_WALLET_ID_LENGTH);
  return new Uint8Array(bech32m.fromWords(decodeAddress.words));
};
