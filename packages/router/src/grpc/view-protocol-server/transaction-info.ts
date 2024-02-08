import type { Impl } from '.';
import { servicesCtx } from '../../ctx';

export const transactionInfo: Impl['transactionInfo'] = async function* (req, ctx) {
  const services = ctx.values.get(servicesCtx);
  const { indexedDb } = await services.getWalletServices();

  for await (const txInfo of indexedDb.iterateTransactionInfo()) {
    // filter transactions between startHeight and endHeight, inclusive
    if (txInfo.height < req.startHeight || (req.endHeight && txInfo.height > req.endHeight))
      continue;

    yield { txInfo };
  }
};
