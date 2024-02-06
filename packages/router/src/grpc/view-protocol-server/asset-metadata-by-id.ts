import type { Impl } from '.';
import { servicesCtx } from '../../ctx';
import { getAssetMetadata } from './helpers';

export const assetMetadataById: Impl['assetMetadataById'] = async (req, ctx) => {
  if (!req.assetId) throw new Error('No asset id passed in request');

  const services = ctx.values.get(servicesCtx);
  const { indexedDb, querier } = await services.getWalletServices();
  const denomMetadata = await getAssetMetadata(req.assetId, indexedDb, querier);

  return { denomMetadata };
};
