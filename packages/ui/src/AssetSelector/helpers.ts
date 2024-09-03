import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { BalancesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';

/** Type predicate to check if a value is a `Metadata`. */
export const isMetadata = (value?: Metadata | BalancesResponse): value is Metadata =>
  value?.getType() === Metadata;

/** Type predicate to check if a value is a `BalancesResponse`. */
export const isBalancesResponse = (
  value?: Metadata | BalancesResponse,
): value is BalancesResponse => value?.getType() === BalancesResponse;
