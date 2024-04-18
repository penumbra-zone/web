import type { Impl } from '.';
import { servicesCtx } from '../ctx/prax';
import { Code, ConnectError } from '@connectrpc/connect';
import { generateTransactionInfo } from '@penumbra-zone/wasm/src/transaction';
import { TransactionInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { fvkCtx } from '../ctx/full-viewing-key';

export const transactionInfoByHash: Impl['transactionInfoByHash'] = async (req, ctx) => {
  if (!req.id) throw new ConnectError('Missing transaction ID in request', Code.InvalidArgument);

  const services = ctx.values.get(servicesCtx);
  const { indexedDb, querier } = await services.getWalletServices();
  const fullViewingKey = ctx.values.get(fvkCtx);
  if (!fullViewingKey) {
    throw new ConnectError('Cannot access full viewing key', Code.Unauthenticated);
  }

  // Check database for transaction first
  // if not in database, query tendermint for public info on the transaction
  const { transaction, height } =
    (await indexedDb.getTransaction(req.id)) ?? (await querier.tendermint.getTransaction(req.id));

  if (!transaction) throw new ConnectError('Transaction not available', Code.NotFound);

  const { txp: perspective, txv: view } = await generateTransactionInfo(
    fullViewingKey,
    transaction,
    indexedDb.constants(),
  );
  const txInfo = new TransactionInfo({ height, id: req.id, transaction, perspective, view });
  return { txInfo };
};
