import { viewClient } from '../clients/grpc';
import { streamToPromise } from './stream';
import { getTransactionClassificationLabel, uint8ArrayToHex } from '@penumbra-zone/types';

export interface TransactionSummary {
  height: number;
  hash: string;
  description: string;
}

export const getAllTransactions = async (): Promise<TransactionSummary[]> => {
  const responses = await streamToPromise(viewClient.transactionInfo({}));
  return responses
    .map(tx => {
      return {
        height: Number(tx.txInfo?.height ?? 0n),
        hash: tx.txInfo?.id?.inner ? uint8ArrayToHex(tx.txInfo.id.inner) : 'unknown',
        description: getTransactionClassificationLabel(tx.txInfo?.view),
      };
    })
    .sort((a, b) => b.height - a.height);
};
