import { Metadata, MetadataSchema } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import {
  BalancesResponse,
  BalancesResponseSchema,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { uint8ArrayToHex } from '@penumbra-zone/types/hex';
import { AssetSelectorValue } from './types.ts';
import { equals, isMessage, toBinary } from '@bufbuild/protobuf';

/** Type predicate to check if a value is a `Metadata`. */
export const isMetadata = (value?: AssetSelectorValue): value is Metadata =>
  !!value && isMessage(value, MetadataSchema);

/** Type predicate to check if a value is a `BalancesResponse`. */
export const isBalancesResponse = (value?: AssetSelectorValue): value is BalancesResponse =>
  !!value && isMessage(value, BalancesResponseSchema);

/** returns a unique id of a specific Metadata or BalancesResponse */
export const getHash = (value: AssetSelectorValue) => {
  return uint8ArrayToHex(
    toBinary(isBalancesResponse(value) ? BalancesResponseSchema : MetadataSchema, value),
  );
};

/** compares Metadata or BalancesResponse with another option */
export const isEqual = (value1: AssetSelectorValue, value2: AssetSelectorValue | undefined) => {
  if (isMetadata(value1)) {
    return isMetadata(value2) && equals(MetadataSchema, value1, value2);
  }

  return isBalancesResponse(value2) && equals(BalancesResponseSchema, value1, value2);
};
