import { validateSchema } from '@penumbra-zone/types';
import { z } from 'zod';
import { get_short_address_by_index, is_controlled_address } from '@penumbra-zone/wasm-bundler';
import { AddressIndex } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1alpha1/keys_pb';
import { JsonValue } from '@bufbuild/protobuf';

export const getShortAddressByIndex = (fullViewingKey: string, index: number): string =>
  validateSchema(z.string(), get_short_address_by_index(fullViewingKey, index));

export const isControlledAddress = (
  fullViewingKey: string,
  address: string,
): AddressIndex | undefined => {
  const res = is_controlled_address(fullViewingKey, address) as JsonValue;
  return res ? AddressIndex.fromJson(res) : undefined;
};
