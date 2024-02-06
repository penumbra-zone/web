import { z } from 'zod';

export const assetId = z.object({
  inner: z.instanceof(Uint8Array),
  altBech32m: z.string(),
  altBaseDenom: z.string(),
});
