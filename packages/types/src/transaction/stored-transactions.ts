import {
  Id,
  Transaction,
  TransactionPerspective,
  TransactionView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import { NoteSource } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/chain/v1alpha1/chain_pb';
import {
  TransactionInfo,
  TransactionInfoResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';

export interface StoredTransaction {
  blockHeight: bigint;
  id: NoteSource;
  tx: Transaction;
  perspective: TransactionPerspective;
  view: TransactionView;
}

export const storedTransactionToProto = (t: StoredTransaction): TransactionInfoResponse => {
  return new TransactionInfoResponse({
    txInfo: new TransactionInfo({
      id: new Id({ hash: t.id.inner }),
      height: t.blockHeight,
      transaction: t.tx,
      perspective: t.perspective,
      view: t.view,
    }),
  });
};
