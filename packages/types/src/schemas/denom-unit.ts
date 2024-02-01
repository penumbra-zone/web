import { z } from 'zod';

export const denomUnit = z.object({
  denom: z.string(),
  exponent: z.number().int(),
  aliases: z.array(z.string()),
});
