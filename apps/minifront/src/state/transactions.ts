import { uint8ArrayToHex } from '@penumbra-zone/types/hex';
import { SliceCreator, useStore } from '.';
import { ViewService } from '@penumbra-zone/protobuf';
import { getTransactionClassificationLabel } from '@penumbra-zone/perspective/transaction/classify';
import { ZQueryState, createZQuery } from '@penumbra-zone/zquery';
import {
  TransactionInfo,
  TransactionInfoResponse,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { getTxInfoByHash } from '../fetchers/tx-info-by-hash';
import { penumbra } from '../prax';

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
  fetch: () => penumbra.service(ViewService).transactionInfo({}),
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
        if (existingIndex >= 0) {
          return prevState.toSpliced(existingIndex, 1, summary);
        } else {
          return [...prevState, summary].sort(byHeight);
        }
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

export const { transactionInfo, useTransactionInfo } = createZQuery({
  name: 'transactionInfo',
  fetch: getTxInfoByHash,
  getUseStore: () => useStore,
  get: state => state.transactions.transactionInfo,
  set: setter => {
    const newState = setter(useStore.getState().transactions.transactionInfo);
    useStore.setState(state => {
      state.transactions.transactionInfo = newState;
    });
  },
});

export interface TransactionsSlice {
  transactionInfo: ZQueryState<TransactionInfo, Parameters<typeof getTxInfoByHash>>;
  summaries: ZQueryState<TransactionSummary[]>;
}

export const createTransactionsSlice = (): SliceCreator<TransactionsSlice> => () => ({
  summaries,
  transactionInfo,
});
