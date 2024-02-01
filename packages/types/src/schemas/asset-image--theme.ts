import { z } from 'zod';

export const assetImage_Theme = z.object({
  primaryColorHex: z.string(),
  circle: z.boolean(),
  darkMode: z.boolean(),
});
