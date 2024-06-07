import type { Impl } from '.';
import { idbCtx, querierCtx } from '../ctx/prax';

export const status: Impl['status'] = async (_, ctx) => {
  const idb = await ctx.values.get(idbCtx)();
  const querier = await ctx.values.get(querierCtx)();
  const latestBlockHeight = await querier.tendermint.latestBlockHeight();
  const fullSyncHeight = await idb.getFullSyncHeight();

  return {
    catchingUp: fullSyncHeight ? fullSyncHeight < latestBlockHeight : true,
    partialSyncHeight: fullSyncHeight,
    fullSyncHeight: fullSyncHeight,
  };
};
