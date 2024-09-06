import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { BalancesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { uint8ArrayToHex } from '@penumbra-zone/types/hex';

/** Type predicate to check if a value is a `Metadata`. */
export const isMetadata = (value?: Metadata | BalancesResponse): value is Metadata =>
  value?.getType() === Metadata;

/** Type predicate to check if a value is a `BalancesResponse`. */
export const isBalancesResponse = (
  value?: Metadata | BalancesResponse,
): value is BalancesResponse => value?.getType() === BalancesResponse;

/** returns a unique id of a specific Metadata or BalancesResponse */
export const getHash = (value: Metadata | BalancesResponse) => {
  return uint8ArrayToHex(value.toBinary());
};
