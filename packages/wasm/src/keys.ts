import {
  generate_spend_key,
  get_address_by_index,
  get_full_viewing_key,
  get_short_address_by_index,
} from '@penumbra-zone/wasm-bundler';
import { z } from 'zod';
import { validateSchema } from 'penumbra-types';

export const generateSpendKey = (seedPhrase: string): string =>
  validateSchema(z.string(), generate_spend_key(seedPhrase));

export const getFullViewingKey = (spendKey: string): string =>
  validateSchema(z.string(), get_full_viewing_key(spendKey));

export const getAddressByIndex = (fullViewingKey: string, index: number): string =>
  validateSchema(z.string(), get_address_by_index(fullViewingKey, index));

export const getShortAddressByIndex = (fullViewingKey: string, index: number): string =>
  validateSchema(z.string(), get_short_address_by_index(fullViewingKey, index));
