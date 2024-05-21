import { AssetId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { get_asset_id_inner } from '../wasm';

/**
 * Converts a base denom name string to an `AssetId` with inner binary field
 * @param altBaseDenom an asset's base denomination name
 * @returns the appropriate `AssetId` with binary inner field
 */
export const assetIdFromBaseDenom = (altBaseDenom: string) => {
  const inner = get_asset_id_inner(new AssetId({ altBaseDenom }).toBinary());
  return new AssetId({ inner });
};
