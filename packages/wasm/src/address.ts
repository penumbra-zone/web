import { get_index_by_address } from '../wasm';
import {
  Address,
  AddressIndex,
  FullViewingKey,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { JsonValue } from '@bufbuild/protobuf';

export const getAddressIndexByAddress = (
  fullViewingKey: FullViewingKey,
  address: Address,
): AddressIndex | undefined => {
  const res = get_index_by_address(fullViewingKey.toJson(), address.toJson()) as JsonValue;
  return res ? AddressIndex.fromJson(res) : undefined;
};

// Only an address controlled by the FVK can view its index
export const isControlledAddress = (fullViewingKey: FullViewingKey, address?: Address): boolean => {
  if (!address) return false;

  const viewableIndex = get_index_by_address(
    fullViewingKey.toJson(),
    address.toJson(),
  ) as JsonValue;
  return Boolean(viewableIndex);
};
