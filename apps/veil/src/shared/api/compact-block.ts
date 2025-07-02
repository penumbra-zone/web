'use client';

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { CompactBlockService, TendermintProxyService } from '@penumbra-zone/protobuf';
import { createClient, Transport } from '@connectrpc/connect';
import { errorIsStreamAbort, useStream } from '@/shared/use-stream.ts';
import { useCallback, useEffect } from 'react';
import { queryClient } from '@/shared/const/queryClient.ts';
import { useGrpcTransport } from '@/shared/api/transport.ts';

const fetchLatestBlockHeight = async (transport: Transport) => {
  const tendermintClient = createClient(TendermintProxyService, transport);
  const { syncInfo } = await tendermintClient.getStatus({});
  if (!syncInfo?.latestBlockHeight) {
    throw new Error('Was not able to sync latest block height');
  }
  return Number(syncInfo.latestBlockHeight);
};

const startBlockHeightStream = async (transport: Transport, signal: AbortSignal) => {
  try {
    const latestBlockHeight = await fetchLatestBlockHeight(transport);
    const blockClient = createClient(CompactBlockService, transport);
    for await (const response of blockClient.compactBlockRange(
      {
        startHeight: BigInt(latestBlockHeight) + 1n,
        keepAlive: true,
      },
      { signal },
    )) {
      if (response.compactBlock?.height) {
        const newHeight = Number(response.compactBlock.height);
        queryClient.setQueryData(LATEST_HEIGHT_QUERY_KEY, newHeight);
      }
    }
  } catch (error) {
    if (!errorIsStreamAbort(error)) {
      console.error('Unexpected compact block streaming error:', error);
    }
  }
};

const lastRefetchedBlockHeights = new Map<string, number>();

export const useRefetchOnNewBlock = (
  queryKey: unknown,
  { refetch }: UseQueryResult,
  disabled?: boolean,
) => {
  const { data: blockHeight } = useLatestBlockHeight();
  const queryKeyString = JSON.stringify(queryKey);

  useEffect(() => {
    if (!blockHeight || disabled) {
      return;
    }

    const lastHeight = lastRefetchedBlockHeights.get(queryKeyString) ?? -1;
    if (blockHeight > lastHeight) {
      lastRefetchedBlockHeights.set(queryKeyString, blockHeight);
      void refetch();
    }
  }, [blockHeight, refetch, queryKeyString, disabled]);
};

export const LATEST_HEIGHT_QUERY_KEY = ['latestBlockHeight'];

export const useLatestBlockHeight = () => {
  const { data, isLoading: transportIsLoading, error: transportError } = useGrpcTransport();

  const res = useQuery({
    queryKey: LATEST_HEIGHT_QUERY_KEY,
    queryFn: async (): Promise<number> => {
      if (!data?.transport) {
        throw new Error('Transport not available');
      }
      return await fetchLatestBlockHeight(data.transport);
    },
    staleTime: Infinity,
    enabled: !!data?.transport,
  });

  // Memoized for use in useStream
  const streamFn = useCallback(
    (signal: AbortSignal) => {
      if (!data?.transport) {
        throw new Error('Transport not available');
      }
      return startBlockHeightStream(data.transport, signal);
    },
    [data?.transport],
  );

  useStream({
    id: 'compactBlockStream',
    enabled: !!data?.transport,
    streamFn,
  });

  return {
    ...res,
    isLoading: transportIsLoading || res.isLoading,
    error: transportError ?? res.error,
  };
};
