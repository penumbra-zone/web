import { z } from 'zod';

export const address = z.object({
  inner: z.instanceof(Uint8Array),
  altBech32m: z.string(),
});
