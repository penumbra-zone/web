import { get_index_by_address, get_short_address_by_index } from '../wasm';
import {
  Address,
  AddressIndex,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { JsonValue } from '@bufbuild/protobuf';
import { bech32Address } from '@penumbra-zone/bech32/src/address';

export const getShortAddressByIndex = (fullViewingKey: string, index: number) =>
  get_short_address_by_index(fullViewingKey, index) as string;

export const getAddressIndexByAddress = (
  fullViewingKey: string,
  address: Address,
): AddressIndex | undefined => {
  const res = get_index_by_address(fullViewingKey, bech32Address(address)) as JsonValue;
  return res ? AddressIndex.fromJson(res) : undefined;
};

// Only an address controlled by the FVK can view its index
export const isControlledAddress = (fullViewingKey: string, address?: Address): boolean => {
  if (!address) return false;

  const viewableIndex = get_index_by_address(fullViewingKey, bech32Address(address)) as JsonValue;
  return Boolean(viewableIndex);
};
