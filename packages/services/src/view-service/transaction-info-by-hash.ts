import type { Impl } from '.';
import { Code, ConnectError } from '@connectrpc/connect';
import { generateTransactionInfo } from '@penumbra-zone/wasm/transaction';
import { TransactionInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { fvkCtx } from '../ctx/full-viewing-key';
import { dbCtx } from '../ctx/database';
import { queryTransaction } from './fullnode/transaction';
import { fullnodeCtx } from '../ctx/fullnode';

export const transactionInfoByHash: Impl['transactionInfoByHash'] = async (req, ctx) => {
  if (!req.id) throw new ConnectError('Missing transaction ID in request', Code.InvalidArgument);

  const indexedDb = await ctx.values.get(dbCtx)();
  const fullnode = await ctx.values.get(fullnodeCtx)();
  const fvk = ctx.values.get(fvkCtx);

  // Check database for transaction first
  // if not in database, query tendermint for public info on the transaction
  const { transaction, height } =
    (await indexedDb.getTransaction(req.id)) ?? (await queryTransaction(fullnode, req.id));

  if (!transaction) throw new ConnectError('Transaction not available', Code.NotFound);

  const { txp: perspective, txv: view } = await generateTransactionInfo(
    await fvk(),
    transaction,
    indexedDb.constants(),
  );
  const txInfo = new TransactionInfo({ height, id: req.id, transaction, perspective, view });
  return { txInfo };
};
