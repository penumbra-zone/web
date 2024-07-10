import { useStore } from '../../../state';
import { ibcInSelector } from '../../../state/ibc-in';
import { useChain, useManager } from '@cosmos-kit/react';
import { UseQueryResult } from '@tanstack/react-query';
import { ProtobufRpcClient } from '@cosmjs/stargate';
import { Coin, createRpcQueryHooks, useRpcClient, useRpcEndpoint } from 'osmo-query';
import { augmentToAsset, toDisplayAmount } from './asset-utils';

// This is sad, but osmo-query's custom hooks require calling .toJSON() on all fields.
// This will throw an error for bigint, so needs to be added to the prototype.
declare global {
  interface BigInt {
    toJSON(): string;
  }
}

BigInt.prototype.toJSON = function () {
  return this.toString();
};

export const useChainConnector = () => {
  const { selectedChain } = useStore(ibcInSelector);
  const { chainRecords } = useManager();
  const selectedOrDefaultChain = selectedChain?.chainName ?? chainRecords[0]?.name;
  if (!selectedOrDefaultChain) {
    throw new Error('No chain available');
  }
  return useChain(selectedOrDefaultChain);
};

const useCosmosQueryHooks = () => {
  const { address, getRpcEndpoint, chain } = useChainConnector();

  const rpcEndpointQuery = useRpcEndpoint({
    getter: getRpcEndpoint,
    options: {
      enabled: !!address,
      staleTime: Infinity,
      queryKey: ['rpc endpoint', address, chain.chain_name],
      // Needed for osmo-query's internal caching
      queryKeyHashFn: queryKey => {
        return JSON.stringify([...queryKey, chain.chain_name]);
      },
    },
  }) as UseQueryResult<string>;

  const rpcClientQuery = useRpcClient({
    rpcEndpoint: rpcEndpointQuery.data ?? '',
    options: {
      enabled: !!address && !!rpcEndpointQuery.data,
      staleTime: Infinity,
      queryKey: ['rpc client', address, rpcEndpointQuery.data, chain.chain_name],
      // Needed for osmo-query's internal caching
      queryKeyHashFn: queryKey => {
        return JSON.stringify([...queryKey, chain.chain_name]);
      },
    },
  }) as UseQueryResult<ProtobufRpcClient>;

  const { cosmos: cosmosQuery, osmosis: osmosisQuery } = createRpcQueryHooks({
    rpc: rpcClientQuery.data,
  });

  const isReady = !!address && !!rpcClientQuery.data;
  const isFetching = rpcEndpointQuery.isFetching || rpcClientQuery.isFetching;

  return { cosmosQuery, osmosisQuery, isReady, isFetching, address, chain };
};

interface BalancesResponse {
  balances: Coin[];
  pagination: { nexKey: Uint8Array; total: bigint };
}

// Reference: https://github.com/cosmos/chain-registry/blob/master/assetlist.schema.json#L60
const ASSET_TYPES = [
  'sdk.coin',
  'cw20',
  'erc20',
  'ics20',
  'snip20',
  'snip25',
  'bitcoin-like',
  'evm-base',
  'svm-base',
  'substrate',
] as const;

type AssetType = (typeof ASSET_TYPES)[number];

export interface CosmosAssetBalance {
  raw: Coin;
  displayDenom: string;
  displayAmount: string;
  icon?: string;
  assetType?: AssetType;
}

interface UseCosmosChainBalancesRes {
  data?: CosmosAssetBalance[];
  isLoading: boolean;
  error: unknown;
}

export const useCosmosChainBalances = (): UseCosmosChainBalancesRes => {
  const { address, cosmosQuery, isReady, chain } = useCosmosQueryHooks();

  const { data, isLoading, error } = cosmosQuery.bank.v1beta1.useAllBalances({
    request: {
      address: address ?? '',
      pagination: {
        offset: 0n,
        limit: 100n,
        key: new Uint8Array(),
        countTotal: true,
        reverse: false,
      },
    },
    options: {
      enabled: isReady,
    },
  }) as UseQueryResult<BalancesResponse>;

  const augmentedAssets = data?.balances.map(coin => {
    const asset = augmentToAsset(coin.denom, chain.chain_name);
    return {
      raw: coin,
      displayDenom: asset.display,
      displayAmount: toDisplayAmount(asset, coin),
      icon: asset.logo_URIs?.svg ?? asset.logo_URIs?.png,
      assetType: assetTypeCheck(asset.type_asset),
    };
  });
  return { data: augmentedAssets, isLoading, error };
};

const assetTypeCheck = (type?: string): AssetType | undefined => {
  return typeof type === 'string' && ASSET_TYPES.includes(type as AssetType)
    ? (type as AssetType)
    : undefined;
};
