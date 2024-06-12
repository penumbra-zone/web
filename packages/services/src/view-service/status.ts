import type { Impl } from '.';
import { dbCtx } from '../ctx/database';
import { servicesCtx } from '../ctx/prax';

export const status: Impl['status'] = async (_, ctx) => {
  const services = await ctx.values.get(servicesCtx)();
  const indexedDb = await ctx.values.get(dbCtx)();
  const { querier } = await services.getWalletServices();
  const latestBlockHeight = await querier.tendermint.latestBlockHeight();
  const fullSyncHeight = (await indexedDb.getFullSyncHeight()) ?? 0n;

  return {
    catchingUp: !latestBlockHeight || latestBlockHeight > fullSyncHeight,
    partialSyncHeight: fullSyncHeight,
    fullSyncHeight: fullSyncHeight,
  };
};
