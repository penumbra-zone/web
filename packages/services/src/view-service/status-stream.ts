import type { Impl } from '.';
import { dbCtx } from '../ctx/database';
import { servicesCtx } from '../ctx/prax';

export const statusStream: Impl['statusStream'] = async function* (_, ctx) {
  const services = await ctx.values.get(servicesCtx)();
  const indexedDb = await ctx.values.get(dbCtx)();
  const { querier } = await services.getWalletServices();

  // This should stream forever unless cancelled.
  let remoteBlockHeight: bigint | undefined;
  for await (const syncHeight of indexedDb.subscribeFullSyncHeight()) {
    remoteBlockHeight ??= await querier.tendermint.latestBlockHeight();
    if (remoteBlockHeight) {
      yield {
        latestKnownBlockHeight: syncHeight <= remoteBlockHeight ? remoteBlockHeight : syncHeight,
        partialSyncHeight: syncHeight,
        fullSyncHeight: syncHeight,
      };
    }
  }
};
