import {
  AssetId,
  DenomMetadata,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import { bech32 } from 'bech32';

export const UNNAMED_ASSET_PREFIX = 'passet';

export const generateMetadata = (assetId: AssetId): DenomMetadata => {
  const words = bech32.toWords(assetId.inner);
  const denom = bech32.encode(UNNAMED_ASSET_PREFIX, words);
  return new DenomMetadata({
    base: denom,
    denomUnits: [{ aliases: [], denom, exponent: 0 }],
    display: denom,
    penumbraAssetId: assetId,
  });
};
