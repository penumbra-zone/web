import type { Impl } from '.';
import { servicesCtx } from '../../ctx';
import { IndexedDbInterface, RootQuerierInterface } from '@penumbra-zone/types';
import { AssetId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';

export const assetMetadataById: Impl['assetMetadataById'] = async (req, ctx) => {
  if (!req.assetId) throw new Error('No asset id passed in request');

  const services = ctx.values.get(servicesCtx);
  const { indexedDb, querier } = await services.getWalletServices();
  const denomMetadata = await getAssetMetadata(req.assetId, indexedDb, querier);

  return { denomMetadata };
};

export const getAssetMetadata = async (
  targetAsset: AssetId,
  indexedDb: IndexedDbInterface,
  querier: RootQuerierInterface,
) => {
  // First, try to get the metadata from the internal database.
  const localMetadata = await indexedDb.getAssetsMetadata(targetAsset);
  if (localMetadata) return localMetadata;

  // If not available locally, query the metadata from the node.
  const nodeMetadata = await querier.shieldedPool.assetMetadata(targetAsset);
  if (nodeMetadata) return nodeMetadata;

  // If the metadata is not found, throw an error with details about the asset.
  throw new Error(`No denom metadata found for asset: ${JSON.stringify(targetAsset.toJson())}`);
};
