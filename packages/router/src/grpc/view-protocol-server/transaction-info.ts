import type { Impl } from '.';
import { servicesCtx } from '../../ctx';
import { TransactionInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';

export const transactionInfo: Impl['transactionInfo'] = async function* (req, ctx) {
  const services = ctx.values.get(servicesCtx);
  const { indexedDb } = await services.getWalletServices();

  // NOTE: https://github.com/penumbra-zone/web/issues/495
  //      Results collected a temp workaround until issue is resolved.
  const txs: { txInfo: TransactionInfo }[] = [];
  for await (const txInfo of indexedDb.iterateTransactionInfo()) {
    // filter transactions between startHeight and endHeight, inclusive
    if (txInfo.height < req.startHeight || (req.endHeight && txInfo.height > req.endHeight))
      continue;
    txs.push({ txInfo });
  }

  for (const tx of txs) {
    yield tx;
  }
};
