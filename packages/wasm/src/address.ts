import { get_index_by_address, is_controlled_address } from '../wasm/index.js';
import {
  Address,
  AddressIndex,
  FullViewingKey,
} from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { JsonValue } from '@bufbuild/protobuf';

export const getAddressIndexByAddress = (
  fullViewingKey: FullViewingKey,
  address: Address,
): AddressIndex | undefined => {
  const res = get_index_by_address(fullViewingKey.toBinary(), address.toBinary()) as JsonValue;
  return res ? AddressIndex.fromJson(res) : undefined;
};

/**
 * Only an address controlled by the FVK can view its index
 *
 * @note don't 'correct' the address parameter to be an optional parameter.
 * `undefined` is a valid input, but input should be required.
 */
export const isControlledAddress = (
  fullViewingKey: FullViewingKey,
  address: Address | undefined,
): address is Address =>
  !!address && is_controlled_address(fullViewingKey.toBinary(), address.toBinary());
