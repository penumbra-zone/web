import type { Impl } from '.';
import { servicesCtx } from '../../ctx';

import { ConnectError, Code } from '@connectrpc/connect';

export const transactionInfoByHash: Impl['transactionInfoByHash'] = async (req, ctx) => {
  const services = ctx.values.get(servicesCtx);
  const { indexedDb, blockProcessor } = await services.getWalletServices();
  if (!req.id) throw new ConnectError('Missing transaction ID in request', Code.InvalidArgument);

  const txInfo =
    (await indexedDb.getTransactionInfo(req.id)) ??
    (await blockProcessor.getTransactionInfo(req.id));

  return { txInfo };
};
