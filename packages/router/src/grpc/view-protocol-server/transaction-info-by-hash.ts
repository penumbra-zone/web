import type { Impl } from '.';
import { servicesCtx } from '../../ctx';
import { Code, ConnectError } from '@connectrpc/connect';
import { generateTransactionInfo } from '@penumbra-zone/wasm';
import { TransactionInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { Transaction } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';

export const transactionInfoByHash: Impl['transactionInfoByHash'] = async (req, ctx) => {
  const services = ctx.values.get(servicesCtx);
  const {
    indexedDb,
    querier,
    viewServer: { fullViewingKey },
  } = await services.getWalletServices();
  if (!req.id) throw new ConnectError('Missing transaction ID in request', Code.InvalidArgument);

  let transaction, height;

  // Check database for transaction first
  const txInDb = await indexedDb.getTransaction(req.id);
  if (txInDb) {
    transaction = Transaction.fromJson(txInDb.tx);
    height = txInDb.height;
  } else {
    // If not in database, query tendermint for public info on the transaction
    const tendermintResult = await querier.tendermint.getTransaction(req.id);
    transaction = tendermintResult.transaction;
    height = tendermintResult.height;
  }

  const { txp: perspective, txv: view } = await generateTransactionInfo(
    fullViewingKey,
    transaction,
    indexedDb.constants(),
  );

  return { txInfo: new TransactionInfo({ height, id: req.id, transaction, perspective, view }) };
};
