import { bech32m } from 'bech32';
import { PENUMBRA_BECH32_ADDRESS_LENGTH, PENUMBRA_BECH32_IDENTITY_PREFIX } from './penumbra-bech32';

export const bech32IdentityKey = (identityKey: { ik: Uint8Array }): string =>
  bech32m.encode(PENUMBRA_BECH32_IDENTITY_PREFIX, bech32m.toWords(identityKey.ik));

export const bech32ToIdentityKey = (bech32IK: string) => {
  const decodeAddress = bech32m.decode(bech32IK, PENUMBRA_BECH32_ADDRESS_LENGTH);
  return new Uint8Array(bech32m.fromWords(decodeAddress.words));
};
