import { useMemo } from 'react';
import { viewClient } from '../clients/grpc';
import { useCollectedStream } from '@penumbra-zone/transport';
import { classifyTransaction, uint8ArrayToHex } from '@penumbra-zone/types';

export const useTxs = () => {
  const transactions = useMemo(() => viewClient.transactionInfo({}), []);
  const { data, error } = useCollectedStream(transactions);

  const formatted = useMemo(
    () =>
      data
        .map(tx => {
          return {
            height: Number(tx.txInfo?.height ?? 0n),
            hash: tx.txInfo?.id?.hash ? uint8ArrayToHex(tx.txInfo.id.hash) : 'unknown',
            description: classifyTransaction(tx.txInfo?.view),
          };
        })
        .sort((a, b) => b.height - a.height),
    [data],
  );

  return { data: formatted, error: error ? String(error) : undefined };
};
