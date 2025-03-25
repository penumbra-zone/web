import type { Impl } from './index.js';
import { servicesCtx } from '../ctx/prax.js';
import { assetPatterns } from '@penumbra-zone/types/assets';
import { getAssetPriorityScore } from './util/asset-priority-score.js';
import { customizeSymbol } from '@penumbra-zone/wasm/metadata';
import { getAssetId } from '@penumbra-zone/getters/metadata';

export const assetMetadataById: Impl['assetMetadataById'] = async ({ assetId }, ctx) => {
  if (!assetId) {
    throw new Error('No asset id passed in request');
  }

  if (!assetId.altBaseDenom && !assetId.altBech32m && !assetId.inner.length) {
    throw new Error(
      'Either `inner`, `altBaseDenom`, or `altBech32m` must be set on the asset ID passed in the `assetMetadataById` request',
    );
  }

  const services = await ctx.values.get(servicesCtx)();
  const { indexedDb, querier } = await services.getWalletServices();

  const localMetadata = await indexedDb.getAssetsMetadata(assetId);
  if (localMetadata) {
    if (!localMetadata.priorityScore) {
      localMetadata.priorityScore = getAssetPriorityScore(
        localMetadata,
        indexedDb.stakingTokenAssetId,
      );
    }
    return { denomMetadata: localMetadata };
  }

  const remoteMetadata = await querier.shieldedPool.assetMetadataById(assetId);
  if (remoteMetadata && !remoteMetadata.priorityScore) {
    remoteMetadata.priorityScore = getAssetPriorityScore(
      remoteMetadata,
      indexedDb.stakingTokenAssetId,
    );
  }

  const isIbcAsset = remoteMetadata && assetPatterns.ibc.matches(remoteMetadata.display);

  if (remoteMetadata && !isIbcAsset) {
    const customized = customizeSymbol(remoteMetadata);
    // eslint-disable-next-line @typescript-eslint/no-misused-spread -- expected behavior
    void indexedDb.saveAssetsMetadata({ ...customized, penumbraAssetId: getAssetId(customized) });
    return { denomMetadata: customized };
  }

  return { denomMetadata: undefined };
};
