import type { Impl } from './index.js';
import { servicesCtx } from '../ctx/prax.js';
import { TransactionInfo } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { generateTransactionInfo } from '@penumbra-zone/wasm/transaction';
import { fvkCtx } from '../ctx/full-viewing-key.js';

export const transactionInfo: Impl['transactionInfo'] = async function* (_req, ctx) {
  const services = await ctx.values.get(servicesCtx)();
  const { indexedDb } = await services.getWalletServices();
  const fullViewingKey = await ctx.values.get(fvkCtx)();

  for await (const txRecord of indexedDb.iterateTransactions()) {
    if (!txRecord.transaction) {
      continue;
    }

    // todo: retrieve transaction perspective and views from indexdb
    // rather than crossing the wasm boundry and regenerating on the
    // fly every page reload.

    const { txp: perspective, txv: view } = await generateTransactionInfo(
      fullViewingKey,
      txRecord.transaction,
      indexedDb.constants(),
    );
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
