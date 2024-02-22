import { IdentityKey } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { bech32m } from 'bech32';

export const bech32IdentityKey = (identityKey: IdentityKey): string =>
  bech32m.encode('penumbravalid', bech32m.toWords(identityKey.ik));
