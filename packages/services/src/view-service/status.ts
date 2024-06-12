import type { Impl } from '.';

import { dbCtx } from '../ctx/database';
import { fullnodeCtx } from '../ctx/fullnode';
import { queryBlockHeight } from './fullnode/block-height';

export const status: Impl['status'] = async (_, ctx) => {
  const indexedDb = await ctx.values.get(dbCtx)();
  const fullnode = await ctx.values.get(fullnodeCtx)();
  const latestBlockHeight = await queryBlockHeight(fullnode);
  const fullSyncHeight = (await indexedDb.getFullSyncHeight()) ?? 0n;

  return {
    catchingUp: !latestBlockHeight || latestBlockHeight > fullSyncHeight,
    partialSyncHeight: fullSyncHeight,
    fullSyncHeight: fullSyncHeight,
  };
};
