import type { Impl } from '.';
import { servicesCtx } from '../../ctx';
import { TransactionInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { generateTransactionInfo } from '@penumbra-zone/wasm';
import { Transaction } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import { TransactionId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/txhash/v1/txhash_pb';

export const transactionInfo: Impl['transactionInfo'] = async function* (req, ctx) {
  const services = ctx.values.get(servicesCtx);
  const {
    indexedDb,
    viewServer: { fullViewingKey },
  } = await services.getWalletServices();

  for await (const txRecord of indexedDb.iterateTransactions()) {
    let id = TransactionId.fromJson(txRecord.id);
    let transaction = Transaction.fromJson(txRecord.tx);
    // filter transactions between startHeight and endHeight, inclusive
    if (txRecord.height < req.startHeight || (req.endHeight && txRecord.height > req.endHeight))
      continue;

    const { txp: perspective, txv: view } = await generateTransactionInfo(
      fullViewingKey,
      transaction,
      indexedDb.constants(),
    );
    const txInfo = new TransactionInfo({
      height: txRecord.height,
      id,
      transaction,
      perspective,
      view,
    });
    yield { txInfo };
  }
};
