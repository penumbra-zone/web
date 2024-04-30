import { useStore } from '../../../state';
import { ibcInSelector } from '../../../state/ibc-in';
import { useChain, useManager } from '@cosmos-kit/react';
import type { UseQueryResult } from '@tanstack/react-query';
import { ProtobufRpcClient } from '@cosmjs/stargate';
import { Coin, createRpcQueryHooks, useRpcClient, useRpcEndpoint } from 'osmo-query';

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
(BigInt.prototype as any).toJSON = function () {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return
  return this.toString();
};

export const useChainConnector = () => {
  const { selectedChain } = useStore(ibcInSelector);
  const { chainRecords } = useManager();
  const defaultChain = chainRecords[0]!.name;
  return useChain(selectedChain?.chainName ?? defaultChain);
};

// TODO: convert this to a single useQuery
const useCosmosQueryHooks = () => {
  const { address, getRpcEndpoint } = useChainConnector();

  const rpcEndpointQuery = useRpcEndpoint({
    getter: getRpcEndpoint,
    options: {
      enabled: !!address,
      staleTime: Infinity,
      queryKey: ['rpc endpoint', address],
      queryKeyHashFn: queryKey => {
        const key = [...queryKey];
        return JSON.stringify(key);
      },
    },
  }) as UseQueryResult<string>;

  const rpcClientQuery = useRpcClient({
    rpcEndpoint: rpcEndpointQuery.data ?? '',
    options: {
      enabled: !!address && !!rpcEndpointQuery.data,
      staleTime: Infinity,
      queryKey: ['rpc client', address, rpcEndpointQuery.data],
      queryKeyHashFn: queryKey => {
        const key = [...queryKey];
        return JSON.stringify(key);
      },
    },
  }) as UseQueryResult<ProtobufRpcClient>;

  const { cosmos: cosmosQuery, osmosis: osmosisQuery } = createRpcQueryHooks({
    rpc: rpcClientQuery.data,
  });

  const isReady = !!address && !!rpcClientQuery.data;
  const isFetching = rpcEndpointQuery.isFetching || rpcClientQuery.isFetching;

  return { cosmosQuery, osmosisQuery, isReady, isFetching, address };
};

export const useIbcBalancesNew = () => {
  const { address, cosmosQuery, isReady } = useCosmosQueryHooks();

  return cosmosQuery.bank.v1beta1.useAllBalances({
    request: {
      address: address ?? '',
      pagination: getPagination(100n),
    },
    options: {
      enabled: isReady,
    },
  }) as UseQueryResult<Coin[]>;
};

export const getPagination = (limit: bigint) => ({
  limit,
  key: new Uint8Array(),
  offset: 0n,
  countTotal: true,
  reverse: false,
});
