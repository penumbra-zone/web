import { viewClient } from '../clients';
import { getTransactionClassificationLabel } from '@penumbra-zone/perspective/transaction/classify';
import { uint8ArrayToHex } from '@penumbra-zone/types/hex';

export interface TransactionSummary {
  height: number;
  hash: string;
  description: string;
}

export const getAllTransactions = async (): Promise<TransactionSummary[]> => {
  const responses = await Array.fromAsync(viewClient.transactionInfo({}));
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
