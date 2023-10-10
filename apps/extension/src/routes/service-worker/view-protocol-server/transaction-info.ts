import {
  TransactionInfoRequest,
  TransactionInfoResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { ViewReqMessage } from './helpers/generic';

import { IndexedDbInterface, StoredTransaction, storedTransactionToProto } from 'penumbra-types';

export const isTransactionInfoRequest = (msg: ViewReqMessage): msg is TransactionInfoRequest => {
  return msg.getType().typeName === TransactionInfoRequest.typeName;
};

export const handleTransactionInfoReq = async function* (
  req: TransactionInfoRequest,
  indexedDb: IndexedDbInterface,
): AsyncIterable<TransactionInfoResponse> {
  const allTxs = await indexedDb.getAllTransactions();
  const responses = allTxs
    .filter(tx => tx.blockHeight >= req.startHeight && endHeightInclusive(tx, req))
    .map(storedTransactionToProto);
  console.log(responses);
  yield* responses;
};

const endHeightInclusive = (tx: StoredTransaction, req: TransactionInfoRequest): boolean => {
  // Default when none passed
  if (req.endHeight === 0n) {
    return true;
  } else {
    return tx.blockHeight <= req.endHeight;
  }
};
