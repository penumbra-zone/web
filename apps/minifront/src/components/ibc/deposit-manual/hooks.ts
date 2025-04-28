import { useStore } from '../../../state';
import { ibcInSelector } from '../../../state/ibc-in';
import { useChain, useManager } from '@cosmos-kit/react';
import { useQuery } from '@tanstack/react-query';
import { augmentToAsset, toDisplayAmount } from './asset-utils';
import { Asset } from '@chain-registry/types';
import { useRegistry } from '../../../fetchers/registry.ts';
import { Chain } from '@penumbra-labs/registry';
import { Coin, StargateClient } from '@cosmjs/stargate';
import { uint8ArrayToHex } from '@penumbra-zone/types/hex';

export const useChainConnector = () => {
  const { selectedChain } = useStore(ibcInSelector);
  const { chainRecords } = useManager();
  const selectedOrDefaultChain = selectedChain?.chainName ?? chainRecords[0]?.name;
  if (!selectedOrDefaultChain) {
    throw new Error('No chain available');
  }
  return useChain(selectedOrDefaultChain);
};

const useCosmosChainBalance = () => {
  const { address, getRpcEndpoint, chain } = useChainConnector();

  return useQuery({
    queryKey: ['rpc endpoint', address, chain.chain_name],
    queryFn: async () => {
      if (!address) {
        throw new Error('missing address');
      }
      const endpoint = await getRpcEndpoint();
      const client = await StargateClient.connect(endpoint);
      return client.getAllBalances(address);
    },
    enabled: !!address,
  });
};

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

    const hash = uint8ArrayToHex(
      new Uint8Array(await crypto.subtle.digest('SHA-256', encodedString)),
    );
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
  } = useQuery({
    queryKey: ['penumbraIbcDenoms', registry],
    queryFn: async () => generatePenumbraIbcDenoms(registry?.ibcConnections ?? []),
    enabled: Boolean(registry),
  });

  return {
    data: ibcAddrs,
    isLoading: registryIsLoading || ibcAddrsLoading,
    error: registryErr ?? ibcAddrssErr,
  };
};

export const useCosmosChainBalances = (): UseCosmosChainBalancesRes => {
  const { chain } = useChainConnector();
  const { data, isLoading: balancesIsLoading, error: balancesError } = useCosmosChainBalance();

  const {
    data: penumbraIbcAddrs,
    isLoading: penumbraIbcAddrsLoading,
    error: penumbraIbcAddrsErr,
  } = usePenumbraIbcDenoms();

  const augmentedAssets = data?.map(coin => {
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
    error: balancesError ?? penumbraIbcAddrsErr,
  };
};

const assetTypeCheck = (type?: string): AssetType | undefined => {
  return typeof type === 'string' && ASSET_TYPES.includes(type as AssetType)
    ? (type as AssetType)
    : undefined;
};
