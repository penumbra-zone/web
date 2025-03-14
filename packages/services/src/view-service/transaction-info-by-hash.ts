import type { Impl } from './index.js';
import { create } from '@bufbuild/protobuf';
import { servicesCtx } from '../ctx/prax.js';
import { Code, ConnectError } from '@connectrpc/connect';
import {
  generateTransactionInfo,
  generateTransactionSummary,
} from '@penumbra-zone/wasm/transaction';
import { TransactionInfoSchema } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { fvkCtx } from '../ctx/full-viewing-key.js';
import { txvTranslator } from './util/transaction-view.js';

export const transactionInfoByHash: Impl['transactionInfoByHash'] = async (req, ctx) => {
  if (!req.id) {
    throw new ConnectError('Missing transaction ID in request', Code.InvalidArgument);
  }

  const services = await ctx.values.get(servicesCtx)();
  const { indexedDb, querier } = await services.getWalletServices();
  const fvk = ctx.values.get(fvkCtx);

  // First, check the database for the transaction.
  // If not found, query Tendermint for public transaction details.
  const { transaction, height } =
    (await indexedDb.getTransaction(req.id)) ?? (await querier.tendermint.getTransaction(req.id));

  if (!transaction) {
    throw new ConnectError('Transaction not available', Code.NotFound);
  }

  // TODO: avoid regenerating the transaction info (TxV, TxP, summary)
  // and query from database if it already exists.
  const { txp: perspective, txv } = await generateTransactionInfo(
    await fvk(),
    transaction,
    indexedDb.constants(),
  );

  // Invoke a higher-level translator on the transaction view.
  const view = txvTranslator(txv);

  // Generate transaction info summary from the TxV.
  const summary = await generateTransactionSummary(txv);

  const txInfo = create(TransactionInfoSchema, {
    height,
    id: req.id,
    transaction,
    perspective,
    view,
    summary,
  });
  return { txInfo };
};
