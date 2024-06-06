import type { Impl } from '.';
import { servicesCtx } from '../ctx/prax';

export const status: Impl['status'] = async (_, ctx) => {
  const services = await ctx.values.get(servicesCtx)();
  const { indexedDb } = await services.getWalletServices();
  const latestBlockHeight = await services.querier.tendermint.latestBlockHeight();
  const fullSyncHeight = (await indexedDb.getFullSyncHeight()) ?? 0n;

  return {
    catchingUp: !latestBlockHeight || latestBlockHeight > fullSyncHeight,
    partialSyncHeight: fullSyncHeight,
    fullSyncHeight: fullSyncHeight,
  };
};
