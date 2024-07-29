import { viewClient } from '../clients';
import { TransactionId, TransactionInfo } from '@penumbra-zone/protobuf/types';
import { hexToUint8Array } from '@penumbra-zone/types/hex';

export const getTxInfoByHash = async (hash: string): Promise<TransactionInfo> => {
  const res = await viewClient.transactionInfoByHash({
    id: new TransactionId({ inner: hexToUint8Array(hash) }),
  });

  const txInfo = res.txInfo;
  if (!txInfo) {
    throw new Error('Transaction info not found');
  }

  return txInfo;
};
