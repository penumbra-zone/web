import type { Impl } from '.';
import { dbCtx } from '../ctx/database';
import { fullnodeCtx } from '../ctx/fullnode';
import { queryBlockHeight } from './fullnode/block-height';

export const statusStream: Impl['statusStream'] = async function* (_, ctx) {
  const indexedDb = await ctx.values.get(dbCtx)();
  const fullnode = await ctx.values.get(fullnodeCtx)();

  // This should stream forever unless cancelled.
  let remoteBlockHeight: bigint | undefined;
  for await (const syncHeight of indexedDb.subscribeFullSyncHeight()) {
    remoteBlockHeight ??= await queryBlockHeight(fullnode);
    if (remoteBlockHeight) {
      yield {
        latestKnownBlockHeight: syncHeight <= remoteBlockHeight ? remoteBlockHeight : syncHeight,
        partialSyncHeight: syncHeight,
        fullSyncHeight: syncHeight,
      };
    }
  }
};
