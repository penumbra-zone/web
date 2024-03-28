import { AssetId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { IndexedDbInterface } from '@penumbra-zone/types/src/indexed-db';
import { RootQuerierInterface } from '@penumbra-zone/types/src/querier';

export const getAssetMetadata = async (
  targetAsset: AssetId,
  indexedDb: IndexedDbInterface,
  querier: RootQuerierInterface,
) => {
  // First, try to get the metadata from the internal database.
  const localMetadata = await indexedDb.getAssetsMetadata(targetAsset);
  if (localMetadata) return localMetadata;

  // If not available locally, query the metadata from the node and save it to
  // the internal database.
  const nodeMetadata = await querier.shieldedPool.assetMetadataById(targetAsset);
  if (nodeMetadata) {
    /**
     * @todo: If possible, save asset metadata proactively if we might need it
     * for a token that the current user doesn't hold. For example, validator
     * delegation tokens could be generated and saved to the database at each
     * epoch boundary.
     */
    void indexedDb.saveAssetsMetadata(nodeMetadata);
    return nodeMetadata;
  }

  // If the metadata is not found, throw an error with details about the asset.
  throw new Error(`No denom metadata found for asset: ${JSON.stringify(targetAsset.toJson())}`);
};
