import type { Impl } from '.';
import { servicesCtx } from '../../ctx';
import { Code, ConnectError } from '@connectrpc/connect';
import { transactionInfo } from '@penumbra-zone/wasm-ts';
import { TransactionInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';

export const transactionInfoByHash: Impl['transactionInfoByHash'] = async (req, ctx) => {
  const services = ctx.values.get(servicesCtx);
  const {
    indexedDb,
    querier,
    viewServer: { fullViewingKey },
  } = await services.getWalletServices();
  if (!req.id) throw new ConnectError('Missing transaction ID in request', Code.InvalidArgument);

  // Check database for transaction first
  const txInDb = await indexedDb.getTransactionInfo(req.id);
  console.log(txInDb?.toJson());
  if (txInDb) return { txInfo: txInDb };

  // If not in database, query tendermint for public info on the transaction
  const { transaction, height } = await querier.tendermint.getTransaction(req.id);
  const { txp: perspective, txv: view } = await transactionInfo(
    fullViewingKey,
    transaction,
    indexedDb.constants(),
  );
  const txInfo = new TransactionInfo({ height, id: req.id, transaction, perspective, view });
  return { txInfo };
};
