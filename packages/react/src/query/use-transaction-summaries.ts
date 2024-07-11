import { ViewService } from '@penumbra-zone/protobuf';
import { usePenumbra } from '../hooks/use-penumbra';
import { usePenumbraServiceSync } from '../hooks/use-penumbra-service';
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { uint8ArrayToHex } from '@penumbra-zone/types/hex';
import { TransactionInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { getTransactionClassificationLabel } from '@penumbra-zone/perspective/transaction/classify';

export interface TransactionSummary {
  height: number;
  hash: string;
  description?: string;
  memo?: string;
}

const getHash = (txInfo: TransactionInfo) =>
  uint8ArrayToHex(Uint8Array.from(txInfo.id?.inner ?? []));

export const useTranasactionSummaries = () => {
  const penumbra = usePenumbra();
  const viewClient = usePenumbraServiceSync(ViewService);

  const [txSummariesByHash, setTxSummariesByHash] = useState<Map<string, TransactionSummary>>(
    new Map(),
  );

  const txSummaries = useQuery({
    queryKey: [penumbra.origin, 'transactionInfo', 'summary'],
    queryFn: ({ signal }) => viewClient.transactionInfo({}, { signal }),
    select: data => {
      return (async function* () {
        for await (const { txInfo } of data) {
          if (!txInfo) continue;
          const summary = {
            height: Number(txInfo.height),
            hash: getHash(txInfo),
            classification: getTransactionClassificationLabel(txInfo.view),
            memo:
              txInfo.view?.bodyView?.memoView?.memoView.case === 'visible'
                ? txInfo.view.bodyView.memoView.memoView.value.plaintext?.text
                : txInfo.view?.bodyView?.memoView?.memoView.case,
          };
          yield summary;
        }
      })();
    },
  });

  useEffect(() => {
    if (!txSummaries.data) return;

    void (async () => {
      const { data } = txSummaries;
      for await (const summary of data) {
        console.log('summaries', txSummariesByHash);
        setTxSummariesByHash(txSummariesByHash.set(summary.hash, summary));
      }
    })();
  }, [txSummaries, txSummariesByHash]);

  const summaries = useMemo(
    () => Array.from(txSummariesByHash.values()).sort((a, b) => b.height - a.height),
    [txSummariesByHash, txSummariesByHash.size],
  );

  return summaries;
};
