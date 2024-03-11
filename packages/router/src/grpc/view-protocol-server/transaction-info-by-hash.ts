import type { Impl } from '.';
import { servicesCtx } from '../../ctx';
import { Code, ConnectError } from '@connectrpc/connect';
import { generateTransactionInfo } from '@penumbra-zone/wasm';
import { TransactionInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';

export const transactionInfoByHash: Impl['transactionInfoByHash'] = async (req, ctx) => {
  const services = ctx.values.get(servicesCtx);
  const {
    indexedDb,
    querier,
    viewServer: { fullViewingKey },
  } = await services.getWalletServices();
  if (!req.id) throw new ConnectError('Missing transaction ID in request', Code.InvalidArgument);

  const { transaction, height } =
    (await indexedDb.getTransaction(req.id)) ?? (await querier.tendermint.getTransaction(req.id));

  if (!transaction) throw new ConnectError('Transaction not available', Code.NotFound);

  const { txp: perspective, txv: view } = await generateTransactionInfo(
    fullViewingKey,
    transaction,
    indexedDb.constants(),
  );

  return { txInfo: new TransactionInfo({ height, id: req.id, transaction, perspective, view }) };
};
