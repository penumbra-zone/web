import { uint8ArrayToHex } from '@penumbra-zone/types/hex';
import { SliceCreator, useStore } from '.';
import { viewClient } from '../clients';
import { getTransactionClassificationLabel } from '@penumbra-zone/perspective/transaction/classify';
import { ZQueryState, createZQuery } from '@penumbra-zone/zquery';
import { TransactionInfoResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';

export interface TransactionSummary {
  height: number;
  hash: string;
  description: string;
}
const byHeight = (a: TransactionSummary, b: TransactionSummary) => b.height - a.height;

const getHash = (tx: TransactionInfoResponse) =>
  tx.txInfo?.id?.inner ? uint8ArrayToHex(tx.txInfo.id.inner) : 'unknown';

export const { summaries, useSummaries } = createZQuery({
  name: 'summaries',
  fetch: () => viewClient.transactionInfo({}),
  stream: () => {
    const txIdsToKeep = new Set<string>();
    return {
      onValue: (prevState: TransactionSummary[] | undefined = [], tx: TransactionInfoResponse) => {
        const hash = getHash(tx);
        txIdsToKeep.add(hash);

        const summary = {
          height: Number(tx.txInfo?.height ?? 0n),
          hash,
          description: getTransactionClassificationLabel(tx.txInfo?.view),
        };

        const existingIndex = prevState.findIndex(summary => summary.hash === hash);

        // Update existing transactions in place, rather than appending
        // duplicates.
        if (existingIndex >= 0) return prevState.toSpliced(existingIndex, 1, summary);
        else return [...prevState, summary].sort(byHeight);
      },

      onEnd: (prevState: TransactionSummary[] | undefined = []) =>
        prevState.filter(({ hash }) => txIdsToKeep.has(hash)),
    };
  },
  getUseStore: () => useStore,
  get: state => state.transactions.summaries,
  set: setter => {
    const newState = setter(useStore.getState().transactions.summaries);
    useStore.setState(state => {
      state.transactions.summaries = newState;
    });
  },
});

export interface TransactionsSlice {
  summaries: ZQueryState<TransactionSummary[]>;
}

export const createTransactionsSlice = (): SliceCreator<TransactionsSlice> => () => ({
  summaries,
});
