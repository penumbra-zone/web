import { get_index_by_address, is_controlled_address } from '../wasm/index.js';
import {
  Address,
  AddressIndex,
  FullViewingKey,
} from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { JsonValue } from '@bufbuild/protobuf';
import { initWasm } from './init.js';

export const getAddressIndexByAddress = async (
  fullViewingKey: FullViewingKey,
  address: Address,
): Promise<AddressIndex | undefined> => {
  await initWasm();
  const res = get_index_by_address(fullViewingKey.toBinary(), address.toBinary()) as JsonValue;
  return res ? AddressIndex.fromJson(res) : undefined;
};

// Only an address controlled by the FVK can view its index
export const isControlledAddress = async (
  fullViewingKey: FullViewingKey,
  address?: Address,
): Promise<boolean> => {
  if (!address) {
    return false;
  }
  await initWasm();
  return is_controlled_address(fullViewingKey.toBinary(), address.toBinary());
};
