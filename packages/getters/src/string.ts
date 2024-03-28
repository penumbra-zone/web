import { IdentityKey } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { createGetter } from './utils/create-getter';
import { bech32ToIdentityKey } from '@penumbra-zone/bech32/src/identity-key';

/**
 * Given a bech32 representation of a validator's identity key, returns an
 * `IdentityKey` object.
 */
export const asIdentityKey = createGetter((bech32IdentityKey?: string) => {
  if (!bech32IdentityKey) return undefined;

  try {
    return new IdentityKey({ ik: bech32ToIdentityKey(bech32IdentityKey) });
  } catch {
    return undefined;
  }
});
