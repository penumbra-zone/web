import type { Impl } from './index.js';
import { servicesCtx } from '../ctx/prax.js';
import { TransactionInfo } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { generateTransactionInfo } from '@penumbra-zone/wasm/transaction';
import { fvkCtx } from '../ctx/full-viewing-key.js';
import {
  TransactionPerspective,
  TransactionView,
} from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';

export const transactionInfo: Impl['transactionInfo'] = async function* (_req, ctx) {
  const services = await ctx.values.get(servicesCtx)();
  const { indexedDb } = await services.getWalletServices();
  const fullViewingKey = await ctx.values.get(fvkCtx)();

  for await (const txRecord of indexedDb.iterateTransactions()) {
    if (!txRecord.transaction) {
      continue;
    }

    // Retrieve transaction perspective and view from indexdb
    // rather than crossing the wasm boundry and regenerating on the
    // fly every page reload.
    let tx_info = await indexedDb.getTransactionInfo(txRecord.id!);
    let perspective: TransactionPerspective;
    let view: TransactionView;

    // If TxP + TxV already exist in database, then yield them.
    if (tx_info) {
      perspective = tx_info.perspective;
      view = tx_info.view;
      // Otherwise, generate the TxP + TxV from the transaction
      // and store them in the table.
    } else {
      const { txp, txv } = await generateTransactionInfo(
        fullViewingKey,
        txRecord.transaction,
        indexedDb.constants(),
      );

      await indexedDb.saveTransactionInfo(txRecord.id!, txp, txv);

      perspective = txp;
      view = txv;
    }

    const txInfo = new TransactionInfo({
      height: txRecord.height,
      id: txRecord.id,
      transaction: txRecord.transaction,
      perspective,
      view,
    });

    yield { txInfo };
  }
};
