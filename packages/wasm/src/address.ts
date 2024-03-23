import { get_short_address_by_index, is_controlled_address } from '../wasm';
import { AddressIndex } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { JsonValue } from '@bufbuild/protobuf';

export const getShortAddressByIndex = (fullViewingKey: string, index: number) =>
  get_short_address_by_index(fullViewingKey, index) as string;

export const getAddressIndexByAddress = (
  fullViewingKey: string,
  bech32Address: string,
): AddressIndex | undefined => {
  const res = is_controlled_address(fullViewingKey, bech32Address) as JsonValue;
  return res ? AddressIndex.fromJson(res) : undefined;
};
