import { TransactionInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { Code, ConnectError } from '@connectrpc/connect';
import { generateTransactionInfo } from '@penumbra-zone/wasm/transaction';
import type { Impl } from '.';
import { fvkCtx } from '../ctx/full-viewing-key';
import { idbCtx, querierCtx } from '../ctx/prax';

export const transactionInfoByHash: Impl['transactionInfoByHash'] = async (req, ctx) => {
  if (!req.id) throw new ConnectError('Missing transaction ID in request', Code.InvalidArgument);

  const idb = await ctx.values.get(idbCtx)();
  const querier = await ctx.values.get(querierCtx)();
  const fvk = ctx.values.get(fvkCtx);

  // Check database for transaction first
  // if not in database, query tendermint for public info on the transaction
  const { transaction, height } =
    (await idb.getTransaction(req.id)) ?? (await querier.tendermint.getTransaction(req.id));

  if (!transaction) throw new ConnectError('Transaction not available', Code.NotFound);

  const { txp: perspective, txv: view } = await generateTransactionInfo(
    await fvk(),
    transaction,
    idb.constants(),
  );
  const txInfo = new TransactionInfo({ height, id: req.id, transaction, perspective, view });
  return { txInfo };
};
