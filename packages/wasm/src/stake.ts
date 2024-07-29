import { Metadata, IdentityKey } from '@penumbra-zone/protobuf/types';
import { get_delegation_asset } from '../wasm/index.js';

export const getDelegationTokenMetadata = (identityKey: IdentityKey): Metadata => {
  const result = get_delegation_asset(identityKey.toBinary());
  return Metadata.fromBinary(result);
};
