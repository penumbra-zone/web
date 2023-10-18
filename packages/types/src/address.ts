import { Address } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1alpha1/keys_pb';
import { bech32m } from 'bech32';

// Globally set Bech32 prefix used for addresses
const BECH32_PREFIX = 'penumbrav2t';

export const bech32Address = (addr: Address): string => {
  return bech32m.encode(BECH32_PREFIX, bech32m.toWords(addr.inner), 160);
};
