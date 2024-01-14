import type { Impl } from '.';
import { servicesCtx } from '../../ctx';

import { TransactionInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';

import { ConnectError, Code } from '@connectrpc/connect';

export const broadcastTransaction: Impl['broadcastTransaction'] = async (req, ctx) => {
  const services = ctx.values.get(servicesCtx);
  const { tendermint } = services.querier;
  const { indexedDb } = await services.getWalletServices();
  if (!req.transaction)
    throw new ConnectError('No transaction provided in request', Code.InvalidArgument);

  // start subscription early to prevent race condition
  const subscription = indexedDb.subscribe('TRANSACTION_INFO');

  const id = await tendermint.broadcastTx(req.transaction);

  // Wait until DB records a new transaction with this id
  if (req.awaitDetection) {
    for await (const { value } of subscription) {
      const update = TransactionInfo.fromJson(value);
      if (id.equals(update.id)) return { id, detectionHeight: update.height };
    }
  }

  return { id };
};
