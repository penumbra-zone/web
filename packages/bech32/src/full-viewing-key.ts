import { bech32m } from 'bech32';
import { PENUMBRA_BECH32_FVK_LENGTH, PENUMBRA_BECH32_FVK_PREFIX } from './penumbra-bech32';

export const bech32FullViewingKey = (fvk: { inner: Uint8Array }): string =>
  bech32m.encode(PENUMBRA_BECH32_FVK_PREFIX, bech32m.toWords(fvk.inner));

export const bech32ToFullViewingKey = (fvk: string) => {
  const decodeAddress = bech32m.decode(fvk, PENUMBRA_BECH32_FVK_LENGTH);
  return new Uint8Array(bech32m.fromWords(decodeAddress.words));
};
