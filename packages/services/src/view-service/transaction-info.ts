import type { Impl } from './index.js';
import { servicesCtx } from '../ctx/prax.js';
import { TransactionInfo } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import {
  generateTransactionInfo,
  generateTransactionSummary,
} from '@penumbra-zone/wasm/transaction';
import { fvkCtx } from '../ctx/full-viewing-key.js';
import {
  TransactionPerspective,
  TransactionSummary,
  TransactionView,
} from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';

export const transactionInfo: Impl['transactionInfo'] = async function* (_req, ctx) {
  const services = await ctx.values.get(servicesCtx)();
  const { indexedDb } = await services.getWalletServices();
  const fullViewingKey = await ctx.values.get(fvkCtx)();

  for await (const txRecord of indexedDb.iterateTransactions()) {
    if (!txRecord.transaction || !txRecord.id) {
      continue;
    }

    // Retrieve the transaction perspective (TxP) and view (TxV) from IndexDB,
    // if it exists, rather than crossing the wasm boundry and regenerating on the
    // fly every page reload.
    const tx_info = await indexedDb.getTransactionInfo(txRecord.id);
    let perspective: TransactionPerspective;
    let view: TransactionView;
    let summary: TransactionSummary;

    // If TxP + TxV + summary already exist in database, then simply yield them.
    if (tx_info && tx_info.summary) {
      perspective = tx_info.perspective;
      view = tx_info.view;
      summary = tx_info.summary;
      // Otherwise, generate the TxP + TxV from the transaction in wasm
      // and store them.
    } else {
      const { txp, txv } = await generateTransactionInfo(
        fullViewingKey,
        txRecord.transaction,
        indexedDb.constants(),
      );

      // Generate and save transaction info summary from the TxV.
      summary = await generateTransactionSummary(txv);
      await indexedDb.saveTransactionInfo(txRecord.id, txp, txv, summary);

      perspective = txp;
      view = txv;
    }

    yield {
      txInfo: new TransactionInfo({
        height: txRecord.height,
        id: txRecord.id,
        transaction: txRecord.transaction,
        perspective,
        view,
        summary,
      }),
    };
  }
};
