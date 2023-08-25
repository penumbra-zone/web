import { z } from 'zod';
import { generate_spend_key } from 'penumbra-wasm-xyz-temp-bundler'; // TODO: Temporary until new npm publishing pipeline setup for each type

const SpendKeySchema = z.string();

export const generateSpendKey = (seedPhrase: string): string =>
  SpendKeySchema.parse(generate_spend_key(seedPhrase));
