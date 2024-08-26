import { useStore } from '../../../state';
import { ibcInSelector } from '../../../state/ibc-in';
import { useChain, useManager } from '@cosmos-kit/react';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { ProtobufRpcClient } from '@cosmjs/stargate';
import { Coin, createRpcQueryHooks, useRpcClient, useRpcEndpoint } from 'osmo-query';
import { augmentToAsset, toDisplayAmount } from './asset-utils';
import { Asset } from '@chain-registry/types';
import { useRegistry } from '../../../fetchers/registry.ts';
import { sha256HashStr } from '@penumbra-zone/crypto-web/sha256';
import { Chain } from '@penumbra-labs/registry';

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
  isPenumbra: boolean;
}

interface UseCosmosChainBalancesRes {
  data?: CosmosAssetBalance[];
  isLoading: boolean;
  error: unknown;
}

const getIconFromAsset = (asset: Asset): string | undefined => {
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Image default is "" and thus cannot do nullish-coalescing
  const logoUri = asset.logo_URIs?.svg || asset.logo_URIs?.png;
  if (logoUri) {
    return logoUri;
  }

  if (asset.images?.length) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- TODO: justify non-null assertion
    const first = asset.images[0]!;
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Image default is "" and thus cannot do nullish-coalescing
    return first.svg || first.svg;
  }
  return undefined;
};

// Generates penumbra token addresses on counterparty chains.
// IBC address derived from sha256 has of path: https://tutorials.cosmos.network/tutorials/6-ibc-dev/
const generatePenumbraIbcDenoms = async (chains: Chain[]): Promise<string[]> => {
  const ibcAddrs: string[] = [];
  for (const c of chains) {
    const ibcStr = `transfer/${c.counterpartyChannelId}/upenumbra`;
    const encoder = new TextEncoder();
    const encodedString = encoder.encode(ibcStr);

    const hash = await sha256HashStr(encodedString);
    ibcAddrs.push(`ibc/${hash.toUpperCase()}`);
  }
  return ibcAddrs;
};

const usePenumbraIbcDenoms = () => {
  const { data: registry, isLoading: registryIsLoading, error: registryErr } = useRegistry();

  const {
    data: ibcAddrs,
    isLoading: ibcAddrsLoading,
    error: ibcAddrssErr,
  } = useQuery(
    ['penumbraIbcDenoms', registry],
    async () => generatePenumbraIbcDenoms(registry?.ibcConnections ?? []),
    {
      enabled: Boolean(registry),
    },
  );

  return {
    data: ibcAddrs,
    isLoading: registryIsLoading || ibcAddrsLoading,
    error: registryErr || ibcAddrssErr,
  };
};

export const useCosmosChainBalances = (): UseCosmosChainBalancesRes => {
  const { address, cosmosQuery, isReady, chain } = useCosmosQueryHooks();

  const {
    data: balancesResponse,
    isLoading: balancesIsLoading,
    error: balancesError,
  } = cosmosQuery.bank.v1beta1.useAllBalances({
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

  const {
    data: penumbraIbcAddrs,
    isLoading: penumbraIbcAddrsLoading,
    error: penumbraIbcAddrsErr,
  } = usePenumbraIbcDenoms();

  const augmentedAssets = balancesResponse?.balances.map(coin => {
    const asset = augmentToAsset(coin.denom, chain.chain_name);
    return {
      raw: coin,
      displayDenom: asset.display,
      displayAmount: toDisplayAmount(asset, coin),
      icon: getIconFromAsset(asset),
      assetType: assetTypeCheck(asset.type_asset),
      isPenumbra: (penumbraIbcAddrs ?? []).includes(coin.denom),
    };
  });

  return {
    data: augmentedAssets,
    isLoading: balancesIsLoading || penumbraIbcAddrsLoading,
    error: balancesError || penumbraIbcAddrsErr,
  };
};

const assetTypeCheck = (type?: string): AssetType | undefined => {
  return typeof type === 'string' && ASSET_TYPES.includes(type as AssetType)
    ? (type as AssetType)
    : undefined;
};
