import type { Impl } from '.';
import { idbCtx, querierCtx } from '../ctx/prax';

export const statusStream: Impl['statusStream'] = async function* (_, ctx) {
  const idb = await ctx.values.get(idbCtx)();
  const querier = await ctx.values.get(querierCtx)();
  const latestBlockHeight = await querier.tendermint.latestBlockHeight();

  // As syncing does not end, nor does this stream.
  // It waits for events triggered externally when block sync has progressed.
  const subscription = idb.subscribe('FULL_SYNC_HEIGHT');

  for await (const update of subscription) {
    const syncHeight = update.value;
    yield {
      latestKnownBlockHeight: syncHeight >= latestBlockHeight ? syncHeight : latestBlockHeight,
      partialSyncHeight: syncHeight,
      fullSyncHeight: syncHeight,
    };
  }
};
