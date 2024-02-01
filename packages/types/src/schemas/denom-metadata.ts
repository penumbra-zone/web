import { z } from 'zod';
import { denomUnit } from './denom-unit';
import { assetId } from './asset-id';
import { assetImage } from './asset-image';

export const denomMetadata = z.object({
  description: z.string(),
  denomUnits: z.array(denomUnit),
  base: z.string(),
  display: z.string(),
  name: z.string(),
  symbol: z.string(),
  penumbraAssetId: assetId.optional(),
  images: z.array(assetImage),
});
