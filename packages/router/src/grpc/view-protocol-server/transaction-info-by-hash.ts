import type { Impl } from '.';
import { servicesCtx } from '../../ctx';

import { NoteSource } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/chain/v1alpha1/chain_pb';

import { ConnectError, Code } from '@connectrpc/connect';

export const transactionInfoByHash: Impl['transactionInfoByHash'] = async (req, ctx) => {
  const services = ctx.values.get(servicesCtx);
  const { indexedDb, blockProcessor } = await services.getWalletServices();
  if (!req.id) throw new ConnectError('Missing transaction ID in request', Code.InvalidArgument);

  const txInfo =
    (await indexedDb.getTransaction(new NoteSource({ inner: req.id.hash }))) ??
    (await blockProcessor.getTxInfoByHash(req.id.hash));

  return txInfo ? { txInfo } : {};
};
