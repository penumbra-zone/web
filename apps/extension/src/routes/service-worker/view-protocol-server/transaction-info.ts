import {
  TransactionInfo,
  TransactionInfoRequest,
  TransactionInfoResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { ViewReqMessage } from './helpers/generic';
import { base64ToUint8Array, IndexedDbInterface, StoredTransaction } from 'penumbra-types';
import { Id } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';

export const isTransactionInfoRequest = (msg: ViewReqMessage): msg is TransactionInfoRequest => {
  return msg.getType().typeName === TransactionInfoRequest.typeName;
};

export const handleTransactionInfoReq = async function* (
  req: TransactionInfoRequest,
  indexedDb: IndexedDbInterface,
): AsyncIterable<TransactionInfoResponse> {
  const allTxs = await indexedDb.getAllTransactions();
  const responses = allTxs
    .filter(tx => tx.blockHeight >= req.startHeight && tx.blockHeight <= req.endHeight)
    .map(storedTxToRes);
  yield* responses;
};

// TODO: Next PR finish this ⬇️
const storedTxToRes = (t: StoredTransaction): TransactionInfoResponse => {
  return new TransactionInfoResponse({
    txInfo: new TransactionInfo({
      id: new Id({ hash: base64ToUint8Array(t.id) }),
      height: t.blockHeight,
      // transaction: new Transaction({
      //   body: new TransactionBody({
      //     actions: t.tx.body.actions.map(a => Action.fromJson(a)),
      //     transactionParameters: t.tx.body.transactionParameters,
      //     fee: t.tx.body.fee,
      //     detectionData: new DetectionData({
      //       fmdClues: t.tx.body.detectionData.fmdClues.map(
      //         c => new Clue({ inner: base64ToUint8Array(c.inner) }),
      //       ),
      //     }),
      //     memoData: new MemoData({
      //       encryptedMemo: base64ToUint8Array(t.tx.body.memoData.encryptedMemo),
      //     }),
      //   }),
      //   bindingSig: base64ToUint8Array(t.tx.bindingSig),
      //   anchor: new MerkleRoot({ inner: base64ToUint8Array(t.tx.anchor.inner) }),
      // }),
      // perspective?: TransactionPerspective;
      // view?: TransactionView;
    }),
  });
};
