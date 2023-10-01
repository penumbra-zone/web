import {
  generate_spend_key,
  get_address_by_index,
  get_full_viewing_key,
  get_short_address_by_index,
} from '@penumbra-zone/wasm-bundler';
import { z } from 'zod';
import { base64ToUint8Array, InnerBase64Schema, validateSchema } from 'penumbra-types';
import { bech32m } from 'bech32';

// Globally set Bech32 prefix used for addresses
const BECH32_PREFIX = 'penumbrav2t';

export const generateSpendKey = (seedPhrase: string): string =>
  validateSchema(z.string(), generate_spend_key(seedPhrase));

export const getFullViewingKey = (spendKey: string): string =>
  validateSchema(z.string(), get_full_viewing_key(spendKey));

export const getAddressByIndex = (fullViewingKey: string, index: number): string => {
  const res = validateSchema(InnerBase64Schema, get_address_by_index(fullViewingKey, index));
  const uintArray = base64ToUint8Array(res.inner);
  return bech32m.encode(BECH32_PREFIX, bech32m.toWords(uintArray), 160);
};

export const getShortAddressByIndex = (fullViewingKey: string, index: number): string =>
  validateSchema(z.string(), get_short_address_by_index(fullViewingKey, index));
