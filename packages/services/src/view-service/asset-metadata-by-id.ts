import type { Impl } from '.';

import { assetPatterns } from '@penumbra-zone/types/assets';
import { dbCtx } from '../ctx/database';
import { fullnodeCtx } from '../ctx/fullnode';
import { queryAssetMetadata } from './fullnode/asset-metadata';

export const assetMetadataById: Impl['assetMetadataById'] = async ({ assetId }, ctx) => {
  if (!assetId) throw new Error('No asset id passed in request');

  if (!assetId.altBaseDenom && !assetId.altBech32m && !assetId.inner.length)
    throw new Error(
      'Either `inner`, `altBaseDenom`, or `altBech32m` must be set on the asset ID passed in the `assetMetadataById` request',
    );

  const indexedDb = await ctx.values.get(dbCtx)();
  const fullnode = await ctx.values.get(fullnodeCtx)();

  let denomMetadata = await indexedDb.getAssetsMetadata(assetId);
  if (!denomMetadata) {
    denomMetadata = await queryAssetMetadata(fullnode, assetId);

    if (denomMetadata?.display && assetPatterns.ibc.matches(denomMetadata.display)) {
      void indexedDb.saveAssetsMetadata(denomMetadata);
    }
  }

  return { denomMetadata };
};
