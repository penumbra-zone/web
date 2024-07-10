import type { Impl } from './index.js';
import { servicesCtx } from '../ctx/prax.js';

export const status: Impl['status'] = async (_, ctx) => {
  const services = await ctx.values.get(servicesCtx)();
  const { indexedDb, querier } = await services.getWalletServices();
  const latestBlockHeight = await querier.tendermint.latestBlockHeight();
  const fullSyncHeight = (await indexedDb.getFullSyncHeight()) ?? 0n;

  return {
    catchingUp: !latestBlockHeight || latestBlockHeight > fullSyncHeight,
    partialSyncHeight: fullSyncHeight,
    fullSyncHeight: fullSyncHeight,
  };
};
