import type { Impl } from '.';
import { servicesCtx } from '../ctx/prax';

export const assetMetadataById: Impl['assetMetadataById'] = async ({ assetId }, ctx) => {
  if (!assetId) throw new Error('No asset id passed in request');

  if (!assetId.altBaseDenom && !assetId.altBech32m && !assetId.inner.length)
    throw new Error(
      'Either `inner`, `altBaseDenom`, or `altBech32m` must be set on the asset ID passed in the `assetMetadataById` request',
    );

  const services = await ctx.values.get(servicesCtx)();
  const { indexedDb, querier } = await services.getWalletServices();

  const localMetadata = await indexedDb.getAssetsMetadata(assetId);
  if (localMetadata) return { denomMetadata: localMetadata };

  const remoteMetadata = await querier.shieldedPool.assetMetadataById(assetId);
  if (remoteMetadata) {
    void indexedDb.saveAssetsMetadata(remoteMetadata);
    return { denomMetadata: remoteMetadata };
  }

  return { denomMetadata: undefined };
};
