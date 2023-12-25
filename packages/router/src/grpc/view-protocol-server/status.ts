import type { Impl } from '.';
import { servicesCtx } from '../../ctx';

export const status: Impl['status'] = async (_, ctx) => {
  const services = ctx.values.get(servicesCtx);
  const { indexedDb } = await services.getWalletServices();
  const latestBlockHeight = await services.querier.tendermint.latestBlockHeight();
  const lastBlockSynced = await indexedDb.getLastBlockSynced();
  if (!lastBlockSynced) throw new Error('Last block synced not in db');

  return {
    catchingUp: lastBlockSynced === latestBlockHeight,
    partialSyncHeight: lastBlockSynced,
    fullSyncHeight: lastBlockSynced,
  };
};
