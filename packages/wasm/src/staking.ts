import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { IdentityKey } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { get_delegation_asset } from '../wasm';

export const getDelegationTokenMetadata = (identityKey: IdentityKey): Metadata => {
  const result = get_delegation_asset(identityKey.toBinary());
  return Metadata.fromBinary(result);
};
