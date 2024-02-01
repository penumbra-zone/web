import { z } from 'zod';
import { assetImage_Theme } from './asset-image--theme';

export const assetImage = z.object({
  png: z.string(),
  svg: z.string(),
  theme: assetImage_Theme.optional(),
});
