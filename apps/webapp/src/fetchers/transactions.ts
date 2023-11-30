import { NotesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { viewClient } from '../clients/grpc';
import { streamToPromise } from '@penumbra-zone/transport';
import { classifyTransaction, uint8ArrayToHex } from '@penumbra-zone/types';

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
        hash: tx.txInfo?.id?.hash ? uint8ArrayToHex(tx.txInfo.id.hash) : 'unknown',
        description: classifyTransaction(tx.txInfo?.view),
      };
    })
    .sort((a, b) => b.height - a.height);
};

export const getAllNotes = async (): Promise<NotesResponse[]> => {
  const responses = await streamToPromise(viewClient.notes({
    includeSpent: true
  }));
  return responses;
};
