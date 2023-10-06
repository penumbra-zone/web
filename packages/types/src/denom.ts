import { z } from 'zod';

const AssetIdSchema = z.object({
  inner: z.instanceof(Uint8Array),
  altBech32m: z.string(),
  altBaseDenom: z.string(),
});

const DenomUnitSchema = z.object({
  denom: z.string(),
  exponent: z.number().int().nonnegative(),
  aliases: z.array(z.string()),
});

export const DenomMetadataSchema = z.object({
  description: z.string(),
  denomUnits: z.array(DenomUnitSchema),
  base: z.string(),
  display: z.string(),
  name: z.string(),
  symbol: z.string(),
  uri: z.string(),
  uriHash: z.string(),
  penumbraAssetId: AssetIdSchema.optional(),
});

export type DenomMetadata = z.infer<typeof DenomMetadataSchema>;
