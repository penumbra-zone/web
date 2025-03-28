import { useWallet } from '@cosmos-kit/react';
import { useQueries } from '@tanstack/react-query';
import { ChainWalletBase, WalletStatus } from '@cosmos-kit/core';
import { useRegistry } from '@/shared/api/registry';

import { Asset } from '@chain-registry/types';
import { assets as cosmosAssetList } from 'chain-registry';
import { Coin, StargateClient } from '@cosmjs/stargate';

// Map of reliable RPC endpoints for different Cosmos chains
const RELIABLE_RPC_ENDPOINTS: Record<string, string> = {
  cosmoshub: 'https://cosmos-rpc.publicnode.com:443',
  osmosis: 'https://rpc.osmosis.zone',
  neutron: 'https://neutron-rpc.publicnode.com:443',
  axelar: 'https://rpc-axelar.imperator.co:443',
  noble: 'https://noble-rpc.polkachu.com',
  celestia: 'https://celestia-rpc.publicnode.com:443',
  stride: 'https://stride-rpc.publicnode.com:443',
};

const getReliableRpcEndpoint = (chainName: string): string | null => {
  const lowerChainName = chainName.toLowerCase();
  return RELIABLE_RPC_ENDPOINTS[lowerChainName] ?? null;
};

export const fetchChainBalances = async (
  address: string,
  chain: ChainWalletBase,
): Promise<readonly Coin[]> => {
  try {
    // First try to use our reliable endpoints
    const reliableEndpoint = getReliableRpcEndpoint(chain.chainName);
    if (reliableEndpoint) {
      try {
        const client = await StargateClient.connect(reliableEndpoint);
        return await client.getAllBalances(address);
      } catch (error) {
        console.warn(
          `Failed to use reliable endpoint for ${chain.chainName}, falling back to default RPC`,
          error,
        );
        // Fall back to default RPC if reliable one fails
      }
    }

    console.warn(`No reliable endpoint found for ${chain.chainName}`);
    // Fall back to the default RPC from chainWalletBase
    const endpoint = await chain.getRpcEndpoint();
    const client = await StargateClient.connect(endpoint);
    return await client.getAllBalances(address);
  } catch (error) {
    console.error(`Failed to fetch balances for ${chain.chainName}:`, error);
    return [];
  }
};

// Searches for corresponding denom in asset registry and returns the metadata
export const augmentToAsset = (denom: string, chainName: string): Asset => {
  const match = cosmosAssetList
    .find(({ chain_name }) => chain_name === chainName)
    ?.assets.find(asset => asset.base === denom);

  return match ? match : fallbackAsset(denom);
};

const fallbackAsset = (denom: string): Asset => {
  return {
    base: denom,
    denom_units: [{ denom, exponent: 0 }],
    display: denom,
    name: denom,
    symbol: denom,
    type_asset: 'sdk.coin',
  };
};

export const useBalances = () => {
  const { chainWallets, status } = useWallet();
  const { data: registry } = useRegistry();
  const result = useQueries({
    queries: chainWallets
      .filter(chain => chain.address !== undefined)
      .map(chain => ({
        queryKey: [
          'cosmos-balances',
          status,
          chain.chainId,
          chain.address,
          registry ? 'registry-available' : 'no-registry',
        ],
        queryFn: async () => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- chains without a valid address were filtered out above
          const balances = await fetchChainBalances(chain.address!, chain);
          return balances.map(coin => {
            return { asset: augmentToAsset(coin.denom, chain.chainName), amount: coin.amount };
          });
        },
        enabled: status === WalletStatus.Connected && chainWallets.length > 0,
        retry: 3, // Retry failed requests 3 times
        staleTime: 60000, // 1 minute stale time to reduce refetches
        cacheTime: 300000, // 5 minutes cache time
      })),
    combine: results => {
      return {
        data: results
          .map(result => result.data)
          .flat(2)
          .filter(Boolean) as { asset: Asset; amount: string }[],
        isLoading: results.some(result => result.isLoading),
        error: results.find(r => r.error !== null)?.error ?? null,
        refetch: () => Promise.all(results.map(result => result.refetch())),
      };
    },
  });

  return {
    balances: result.data,
    isLoading: result.isLoading && status === WalletStatus.Connected,
    error: result.error ? String(result.error) : null,
    refetch: result.refetch,
  };
};
