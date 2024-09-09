import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { BalancesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { uint8ArrayToHex } from '@penumbra-zone/types/hex';
import { SelectorValue } from './types.ts';

/** Type predicate to check if a value is a `Metadata`. */
export const isMetadata = (value?: SelectorValue): value is Metadata =>
  value?.getType() === Metadata;

/** Type predicate to check if a value is a `BalancesResponse`. */
export const isBalancesResponse = (value?: SelectorValue): value is BalancesResponse =>
  value?.getType() === BalancesResponse;

/** returns a unique id of a specific Metadata or BalancesResponse */
export const getHash = (value: SelectorValue) => {
  return uint8ArrayToHex(value.toBinary());
};

/** compares Metadata or BalancesResponse with another option */
export const isEqual = (value1: SelectorValue, value2: SelectorValue | undefined) => {
  if (isMetadata(value1)) {
    return isMetadata(value2) && value1.equals(value2);
  }

  return isBalancesResponse(value2) && value1.equals(value2);
};
