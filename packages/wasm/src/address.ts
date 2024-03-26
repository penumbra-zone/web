import { get_short_address_by_index, is_controlled_address } from '../wasm';
import {
  Address,
  AddressIndex,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { JsonValue } from '@bufbuild/protobuf';
import { bech32Address } from '@penumbra-zone/bech32/src/address';

export const getShortAddressByIndex = (fullViewingKey: string, index: number) =>
  get_short_address_by_index(fullViewingKey, index);

export const getAddressIndexByAddress = (
  fullViewingKey: string,
  address: Address,
): AddressIndex | undefined => {
  const res = is_controlled_address(fullViewingKey, bech32Address(address)) as JsonValue;
  return res ? AddressIndex.fromJson(res) : undefined;
};

export const isControlledAddress = (fullViewingKey: string, address?: Address): boolean =>
  address ? Boolean(is_controlled_address(fullViewingKey, bech32Address(address))) : false;
