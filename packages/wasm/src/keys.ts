import {
  generate_spend_key,
  get_address_by_index,
  get_ephemeral_address,
  get_full_viewing_key,
  get_short_address_by_index,
  get_wallet_id,
  is_controlled_address,
} from '@penumbra-zone/wasm-bundler';
import { z } from 'zod';
import { base64ToUint8Array, InnerBase64Schema, validateSchema } from '@penumbra-zone/types';
import {
  Address,
  AddressIndex,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1alpha1/keys_pb';

export const generateSpendKey = (seedPhrase: string): string =>
  validateSchema(z.string(), generate_spend_key(seedPhrase));

export const getFullViewingKey = (spendKey: string): string =>
  validateSchema(z.string(), get_full_viewing_key(spendKey));

export const getAddressByIndex = (fullViewingKey: string, index: number): Address => {
  const res = validateSchema(InnerBase64Schema, get_address_by_index(fullViewingKey, index));
  const uintArray = base64ToUint8Array(res.inner);
  return new Address({ inner: uintArray });
};

export const getEphemeralByIndex = (fullViewingKey: string, index: number): Address => {
  const res = validateSchema(InnerBase64Schema, get_ephemeral_address(fullViewingKey, index));
  const uintArray = base64ToUint8Array(res.inner);
  return new Address({ inner: uintArray });
};

export const getIndexByAddress = (fullViewingKey: string, address: string): AddressIndex => {
  const res = validateSchema(
    z
      .object({
        account: z.number().optional(),
        randomizer: z.string(),
      })
      .optional(),
    is_controlled_address(fullViewingKey, address),
  );
  if (!res) throw new Error('address does not exist');

  return new AddressIndex().fromJson({
    account: res.account ?? 0,
    randomizer: res.randomizer,
  });
};

export const getShortAddressByIndex = (fullViewingKey: string, index: number): string =>
  validateSchema(z.string(), get_short_address_by_index(fullViewingKey, index));

export const getWalletId = (fullViewingKey: string): string =>
  validateSchema(z.string(), get_wallet_id(fullViewingKey));
