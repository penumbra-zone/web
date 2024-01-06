import type { Impl } from '.';
import { servicesCtx } from '../../ctx';

import { CommitmentSource_Transaction } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/sct/v1alpha1/sct_pb';

import { ConnectError, Code } from '@connectrpc/connect';

export const transactionInfoByHash: Impl['transactionInfoByHash'] = async (req, ctx) => {
  const services = ctx.values.get(servicesCtx);
  const { indexedDb, blockProcessor } = await services.getWalletServices();
  if (!req.id) throw new ConnectError('Missing transaction ID in request', Code.InvalidArgument);

  const txInfo =
    (await indexedDb.getTransaction(new CommitmentSource_Transaction({ id: req.id.inner }))) ??
    (await blockProcessor.getTxInfoByHash(req.id.inner));

  return txInfo ? { txInfo } : {};
};
