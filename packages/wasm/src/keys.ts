import {
  generate_spend_key,
  get_address_by_index,
  get_full_viewing_key,
  get_short_address_by_index,
} from '@penumbra-zone/wasm-bundler';
import { z } from 'zod';

const StringSchema = z.string();

export const generateSpendKey = (seedPhrase: string): string =>
  StringSchema.parse(generate_spend_key(seedPhrase));

export const getFullViewingKey = (spendKey: string): string =>
  StringSchema.parse(get_full_viewing_key(spendKey));

export const getAddressByIndex = (fullViewingKey: string, index: number): string =>
  StringSchema.parse(get_address_by_index(fullViewingKey, index));

export const getShortAddressByIndex = (fullViewingKey: string, index: number): string =>
  StringSchema.parse(get_short_address_by_index(fullViewingKey, index));
