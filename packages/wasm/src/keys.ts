import { z } from 'zod';
import { generate_spend_key } from '@penumbra-zone/wasm-bundler';

const SpendKeySchema = z.string();

export const generateSpendKey = (seedPhrase: string): string =>
  SpendKeySchema.parse(generate_spend_key(seedPhrase));
