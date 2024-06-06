import type { Impl } from '.';
import { servicesCtx } from '../ctx/prax';

export const statusStream: Impl['statusStream'] = async function* (_, ctx) {
  const services = await ctx.values.get(servicesCtx)();
  const { indexedDb } = await services.getWalletServices();

  // This should stream forever unless cancelled.
  let remoteBlockHeight: bigint | undefined;
  for await (const { value: syncHeight } of indexedDb.subscribe('FULL_SYNC_HEIGHT'))
    if ((remoteBlockHeight ??= await services.querier.tendermint.latestBlockHeight()))
      yield {
        latestKnownBlockHeight: syncHeight <= remoteBlockHeight ? remoteBlockHeight : syncHeight,
        partialSyncHeight: syncHeight,
        fullSyncHeight: syncHeight,
      };
};
