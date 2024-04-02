import { bech32m } from 'bech32';
import {
  PENUMBRA_BECH32_SPEND_KEY_LENGTH,
  PENUMBRA_BECH32_SPEND_KEY_PREFIX,
} from './penumbra-bech32';

export const bech32SpendKey = (fvk: { inner: Uint8Array }): string =>
  bech32m.encode(PENUMBRA_BECH32_SPEND_KEY_PREFIX, bech32m.toWords(fvk.inner));

export const bech32ToSpendKey = (fvk: string) => {
  const decodeAddress = bech32m.decode(fvk, PENUMBRA_BECH32_SPEND_KEY_LENGTH);
  return new Uint8Array(bech32m.fromWords(decodeAddress.words));
};
