import type { Impl } from '.';
import { servicesCtx } from '../../ctx';

export const assets: Impl['assets'] = async function* (_, ctx) {
  const services = ctx.values.get(servicesCtx);
  const { indexedDb } = await services.getWalletServices();
  const allMetadata = await indexedDb.getAllAssetsMetadata();
  const responses = allMetadata.map(denomMetadata => ({ denomMetadata }));
  yield* responses;
};
