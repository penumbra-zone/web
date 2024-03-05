import { IdentityKey } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { createGetter } from './utils/create-getter';
import { bech32m } from 'bech32';

/**
 * Given a bech32 representation of a validator's identity key, returns an
 * `IdentityKey` object.
 */
export const asIdentityKey = createGetter((bech32IdentityKey?: string) => {
  if (!bech32IdentityKey) return undefined;

  try {
    const { words } = bech32m.decode(bech32IdentityKey);

    return new IdentityKey({
      ik: new Uint8Array(bech32m.fromWords(words)),
    });
  } catch {
    return undefined;
  }
});
