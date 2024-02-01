import { denomMetadata } from '../schemas/denom-metadata';
import { isType } from '../validation';
import { z } from 'zod';

export const hasDenomMetadata = isType(
  z.object({
    valueView: z.object({
      case: z.literal('knownAssetId'),
      value: z.object({
        metadata: denomMetadata,
      }),
    }),
  }),
);
