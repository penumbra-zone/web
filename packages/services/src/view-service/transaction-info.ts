import type { Impl } from '.';
import { servicesCtx } from '../ctx/prax';
import { TransactionInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { generateTransactionInfo } from '@penumbra-zone/wasm/transaction';
import { fvkCtx } from '../ctx/full-viewing-key';

export const transactionInfo: Impl['transactionInfo'] = async function* (
  { startHeight, endHeight },
  ctx,
) {
  const services = await ctx.values.get(servicesCtx)();
  const { indexedDb } = await services.getWalletServices();

  const fullViewingKey = await ctx.values.get(fvkCtx)();

  for await (const { height, id, transaction } of indexedDb.iterateTransactions(
    startHeight,
    endHeight || undefined,
  )) {
    if (!transaction) continue;
    const { txp: perspective, txv: view } = await generateTransactionInfo(
      fullViewingKey,
      transaction,
      indexedDb.constants(),
    );
    const txInfo = new TransactionInfo({
      height: height,
      id: id,
      transaction: transaction,
      perspective,
      view,
    });
    yield { txInfo };
  }
};
