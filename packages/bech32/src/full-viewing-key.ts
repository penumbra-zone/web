import { bech32m } from 'bech32';
import { PENUMBRA_BECH32_FVK_LENGTH } from './penumbra-bech32';

export const bech32ToFullViewingKey = (fvk: string) => {
  const decodeAddress = bech32m.decode(fvk, PENUMBRA_BECH32_FVK_LENGTH);
  return new Uint8Array(bech32m.fromWords(decodeAddress.words));
};
