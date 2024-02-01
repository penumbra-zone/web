import { z } from 'zod';

export const addressIndex = z.object({
  account: z.number().int(),
  randomizer: z.instanceof(Uint8Array),
});
