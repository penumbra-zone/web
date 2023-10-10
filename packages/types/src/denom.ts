import { z } from 'zod';
import {
  AssetId,
  DenomMetadata as DenomMetadataProto,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';

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

export const denomToProto = (d: DenomMetadata): DenomMetadataProto => {
  return new DenomMetadataProto({
    description: d.description,
    denomUnits: d.denomUnits,
    base: d.base,
    display: d.display,
    name: d.name,
    symbol: d.symbol,
    uri: d.uri,
    uriHash: d.uriHash,
    penumbraAssetId: d.penumbraAssetId ? d.penumbraAssetId : new AssetId(),
  });
};

export const denomsToProto = (denoms: DenomMetadata[]): DenomMetadataProto[] =>
  denoms.map(denomToProto);
