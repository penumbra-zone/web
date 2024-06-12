import type { Impl } from '.';

import { TransactionInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { generateTransactionInfo } from '@penumbra-zone/wasm/transaction';
import { dbCtx } from '../ctx/database';
import { fvkCtx } from '../ctx/full-viewing-key';

export const transactionInfo: Impl['transactionInfo'] = async function* (req, ctx) {
  const indexedDb = await ctx.values.get(dbCtx)();

  const fvk = ctx.values.get(fvkCtx);

  for await (const txRecord of indexedDb.iterateTransactions()) {
    // filter transactions between startHeight and endHeight, inclusive
    if (
      !txRecord.transaction ||
      txRecord.height < req.startHeight ||
      (req.endHeight && txRecord.height > req.endHeight)
    )
      continue;

    const { txp: perspective, txv: view } = await generateTransactionInfo(
      await fvk(),
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
