import { AssetId } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { get_asset_id } from '../wasm/index.js';

/**
 * Converts a base denom name string to an `AssetId` with inner binary field
 * @param altBaseDenom an asset's base denomination name
 * @returns the appropriate `AssetId`
 */
export const assetIdFromBaseDenom = (altBaseDenom: string) => {
  const inputBytes = new AssetId({ altBaseDenom }).toBinary();
  const outputBytes = get_asset_id(inputBytes);
  return AssetId.fromBinary(outputBytes);
};
