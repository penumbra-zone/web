import type { Impl } from '.';
import { servicesCtx } from '../../ctx';

import { NoteSource } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/chain/v1alpha1/chain_pb';

export const transactionInfoByHash: Impl['transactionInfoByHash'] = async (req, ctx) => {
  const services = ctx.values.get(servicesCtx);
  const { indexedDb, blockProcessor } = await services.getWalletServices();
  if (!req.id) throw new Error('Missing transaction ID in request');

  const txInfo =
    (await indexedDb.getTransaction(new NoteSource({ inner: req.id.hash }))) ??
    (await blockProcessor.getTxInfoByHash(req.id.hash));

  return txInfo ? { txInfo } : {};
};
