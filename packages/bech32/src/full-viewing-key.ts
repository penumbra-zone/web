import { bech32m } from 'bech32';
import { PENUMBRA_BECH32_FVK_LENGTH, PENUMBRA_BECH32_FVK_PREFIX } from './penumbra-bech32';
import { FullViewingKey } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';

export const bech32FullViewingKey = (fvk: FullViewingKey): string =>
  bech32m.encode(PENUMBRA_BECH32_FVK_PREFIX, bech32m.toWords(fvk.inner));

export const bech32ToFullViewingKey = (fvk: string): FullViewingKey => {
  const decodeAddress = bech32m.decode(fvk, PENUMBRA_BECH32_FVK_LENGTH);
  return new FullViewingKey({ inner: new Uint8Array(bech32m.fromWords(decodeAddress.words)) });
};
