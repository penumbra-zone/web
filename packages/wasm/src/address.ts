import { get_index_by_address, is_controlled_address } from '../wasm/index.js';
import {
  Address,
  AddressIndex,
  AddressIndexSchema,
  AddressSchema,
  FullViewingKey,
  FullViewingKeySchema,
} from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { JsonValue, fromJson, toBinary } from '@bufbuild/protobuf';

export const getAddressIndexByAddress = (
  fullViewingKey: FullViewingKey,
  address: Address,
): AddressIndex | undefined => {
  const res = get_index_by_address(
    toBinary(FullViewingKeySchema, fullViewingKey),
    toBinary(AddressSchema, address),
  ) as JsonValue;
  return res ? fromJson(AddressIndexSchema, res) : undefined;
};

// Only an address controlled by the FVK can view its index
export const isControlledAddress = (fullViewingKey: FullViewingKey, address?: Address): boolean => {
  if (!address) {
    return false;
  }
  return is_controlled_address(
    toBinary(FullViewingKeySchema, fullViewingKey),
    toBinary(AddressSchema, address),
  );
};
