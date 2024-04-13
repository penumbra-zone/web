import { uint8ArrayToHex } from '@penumbra-zone/types/src/hex';
import { SliceCreator } from '.';
import { viewClient } from '../clients';
import { getTransactionClassificationLabel } from '@penumbra-zone/perspective/transaction/classify';

export interface TransactionSummary {
  height: number;
  hash: string;
  description: string;
}

export interface TransactionsSlice {
  summaries: TransactionSummary[];
  loadSummaries: () => Promise<void>;
}

export const createTransactionsSlice = (): SliceCreator<TransactionsSlice> => (set, get) => ({
  summaries: [],

  loadSummaries: async () => {
    set(state => {
      state.transactions.summaries = [];
    });

    for await (const tx of viewClient.transactionInfo({})) {
      const summary = {
        height: Number(tx.txInfo?.height ?? 0n),
        hash: tx.txInfo?.id?.inner ? uint8ArrayToHex(tx.txInfo.id.inner) : 'unknown',
        description: getTransactionClassificationLabel(tx.txInfo?.view),
      };

      const summaries = [...get().transactions.summaries, summary].sort(
        (a, b) => b.height - a.height,
      );

      set(state => {
        state.transactions.summaries = summaries;
      });
    }
  },
});
