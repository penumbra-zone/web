import type { Impl } from '.';
import { servicesCtx } from '../ctx/prax';

export const statusStream: Impl['statusStream'] = async function* (_, ctx) {
  const services = await ctx.values.get(servicesCtx)();
  const { indexedDb } = await services.getWalletServices();
  const latestBlockHeight = await services.querier.tendermint.latestBlockHeight();

  // As syncing does not end, nor does this stream.
  // It waits for events triggered externally when block sync has progressed.
  const subscription = indexedDb.subscribe('FULL_SYNC_HEIGHT');

  for await (const update of subscription) {
    const syncHeight = update.value;
    yield {
      latestKnownBlockHeight: syncHeight >= latestBlockHeight ? syncHeight : latestBlockHeight,
      partialSyncHeight: syncHeight,
      fullSyncHeight: syncHeight,
    };
  }
};
