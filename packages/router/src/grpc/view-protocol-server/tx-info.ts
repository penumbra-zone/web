import {
  TransactionInfo,
  TransactionInfoRequest,
  TransactionInfoResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { ViewReqMessage } from './router';
import { ServicesInterface } from '@penumbra-zone/types';

export const isTransactionInfoRequest = (msg: ViewReqMessage): msg is TransactionInfoRequest => {
  return msg.getType().typeName === TransactionInfoRequest.typeName;
};

export const handleTransactionInfoReq = async function* (
  req: TransactionInfoRequest,
  services: ServicesInterface,
): AsyncIterable<TransactionInfoResponse> {
  const { indexedDb } = await services.getWalletServices();

  const allTxs = await indexedDb.getAllTransactions();
  const responses = allTxs
    .filter(tx => tx.height >= req.startHeight && endHeightInclusive(tx, req))
    .map(txInfo => new TransactionInfoResponse({ txInfo }));
  yield* responses;
};

const endHeightInclusive = (tx: TransactionInfo, req: TransactionInfoRequest): boolean => {
  // Default when none passed
  if (req.endHeight === 0n) {
    return true;
  } else {
    return tx.height <= req.endHeight;
  }
};
