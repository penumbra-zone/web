import type { Impl } from '.';
import { servicesCtx } from '../../ctx';

export const transactionInfo: Impl['transactionInfo'] = async function* (req, ctx) {
  const services = ctx.values.get(servicesCtx);
  const { indexedDb } = await services.getWalletServices();

  const allTxs = await indexedDb.getAllTransactionInfo();
  const responses = allTxs
    // filter transactions between startHeight and endHeight, inclusive
    .filter(tx => tx.height >= req.startHeight && (!req.endHeight || tx.height <= req.endHeight))
    .map(txInfo => ({ txInfo }));
  yield* responses;
};
