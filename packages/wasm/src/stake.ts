import { MetadataSchema } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { fromBinary, toBinary } from '@bufbuild/protobuf';
import type { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import {
  IdentityKey,
  IdentityKeySchema,
} from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { get_delegation_asset } from '../wasm/index.js';

export const getDelegationTokenMetadata = (identityKey: IdentityKey): Metadata => {
  const result = get_delegation_asset(toBinary(IdentityKeySchema, identityKey));
  return fromBinary(MetadataSchema, result);
};
