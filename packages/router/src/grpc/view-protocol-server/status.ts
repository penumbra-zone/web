import type { Impl } from '.';
import { servicesCtx } from '../../ctx';

export const status: Impl['status'] = async (_, ctx) => {
  const services = ctx.values.get(servicesCtx);
  const { indexedDb } = await services.getWalletServices();
  const latestBlockHeight = await services.querier.tendermint.latestBlockHeight();
  const fullSyncHeight = await indexedDb.getFullSyncHeight();
  if (!fullSyncHeight) throw new Error('Last block synced not in db');

  return {
    catchingUp: fullSyncHeight === latestBlockHeight,
    partialSyncHeight: fullSyncHeight,
    fullSyncHeight: fullSyncHeight,
  };
};
