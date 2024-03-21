import type { Impl } from '.';
import { servicesCtx } from '../../ctx/prax';
import { getAssetMetadata } from './helpers';

export const assetMetadataById: Impl['assetMetadataById'] = async (req, ctx) => {
  if (!req.assetId) throw new Error('No asset id passed in request');
  if (!req.assetId.altBaseDenom && !req.assetId.altBech32m && !req.assetId.inner.length) {
    throw new Error(
      'Either `inner`, `altBaseDenom`, or `altBech32m` must be set on the asset ID passed in the `assetMetadataById` request',
    );
  }

  const services = ctx.values.get(servicesCtx);
  const { indexedDb, querier } = await services.getWalletServices();

  const denomMetadata = await getAssetMetadata(req.assetId, indexedDb, querier);

  return { denomMetadata };
};
