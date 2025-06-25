import { useWallet } from '@cosmos-kit/react';
import { useQueries } from '@tanstack/react-query';
import { ChainWalletBase, WalletStatus } from '@cosmos-kit/core';

import { Asset } from '@chain-registry/types';
import cosmosAssetList from 'chain-registry/assets';
import { Coin, StargateClient } from '@cosmjs/stargate';
import { RPC_ENDPOINTS } from './cosmos-endpoints';

/** @var failedEndpoints is a map of endpoint -> timestamp of last failure */
const failedEndpoints = new Map<string, number>();
const FAILURE_COOLDOWN = 5 * 60 * 1000; // 5 minutes

const isEndpointHealthy = (endpoint: string): boolean => {
  const failureTime = failedEndpoints.get(endpoint);
  if (!failureTime) {
    return true;
  }

  const now = Date.now();
  if (now - failureTime > FAILURE_COOLDOWN) {
    failedEndpoints.delete(endpoint); // Remove from failed list after cooldown
    return true;
  }

  return false;
};

const markEndpointFailed = (endpoint: string): void => {
  failedEndpoints.set(endpoint, Date.now());
};

const getHealthyEndpoints = (chainId: string): string[] => {
  const key = chainId.toLowerCase();
  const endpoints = RPC_ENDPOINTS[key] ?? [];
  return endpoints.filter(isEndpointHealthy);
};

const sleep = (ms: number): Promise<void> =>
  new Promise(resolve => {
    setTimeout(resolve, ms);
  });

const tryConnectWithRetry = async (endpoint: string, retries = 2): Promise<StargateClient> => {
  // exponential backoff
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const client = await StargateClient.connect(endpoint);
      return client;
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      await sleep(1000 * Math.pow(2, attempt));
    }
  }

  throw new Error('Max retries exceeded');
};

export const fetchChainBalances = async (
  address: string,
  chain: ChainWalletBase,
): Promise<readonly Coin[]> => {
  const { chainId } = chain;
  const healthyEndpoints = getHealthyEndpoints(chainId);

  // Try our reliable endpoints first
  for (const endpoint of healthyEndpoints) {
    try {
      const client = await tryConnectWithRetry(endpoint);
      const balances = await client.getAllBalances(address);
      return balances;
    } catch (error) {
      markEndpointFailed(endpoint);
      console.warn(
        `RPC endpoint failed for ${chain.chainName} (${chainId}): ${endpoint}. Trying next endpoint...`,
      );
    }
  }

  // Fall back to the default RPC from chainWalletBase if all our endpoints failed
  try {
    const defaultEndpoint = await chain.getRpcEndpoint();
    const defaultEndpointString =
      typeof defaultEndpoint === 'string' ? defaultEndpoint : defaultEndpoint.url;

    // Check if the default endpoint is different from our known endpoints
    if (
      !healthyEndpoints.includes(defaultEndpointString) &&
      isEndpointHealthy(defaultEndpointString)
    ) {
      const client = await tryConnectWithRetry(defaultEndpointString);
      const balances = await client.getAllBalances(address);
      return balances;
    }
  } catch (error) {
    // Mark default endpoint as failed too
    try {
      const defaultEndpoint = await chain.getRpcEndpoint();
      const defaultEndpointString =
        typeof defaultEndpoint === 'string' ? defaultEndpoint : defaultEndpoint.url;
      markEndpointFailed(defaultEndpointString);
    } catch {
      // Ignore error getting default endpoint
    }
  }

  // All endpoints failed
  console.error(
    `All RPC endpoints failed for ${chain.chainName} (${chainId}). Retrying will be attempted after cooldown period.`,
  );

  return [];
};

// Searches for corresponding denom in asset registry and returns the metadata
export const augmentToAsset = (denom: string, chainName: string): Asset => {
  const match = cosmosAssetList
    .find(({ chain_name }) => chain_name === chainName)
    ?.assets.find(asset => asset.base === denom);

  return match ?? fallbackAsset(denom);
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
  const result = useQueries({
    queries: chainWallets
      .filter(
        (
          chain,
        ): chain is ChainWalletBase & {
          get address(): string;
        } => chain.address !== undefined,
      )
      .map(chain => ({
        queryKey: ['cosmos-balances', status, chain.chainId, chain.address],
        queryFn: async () => {
          if (status !== WalletStatus.Connected && chainWallets.length === 0) {
            return [];
          }

          const balances = await fetchChainBalances(chain.address, chain);
          return balances.map(coin => {
            return {
              asset: augmentToAsset(coin.denom, chain.chainName),
              amount: coin.amount,
              chainId: chain.chainId,
            };
          });
        }, // Cap at 30s
        staleTime: 30 * 1000, // Consider data stale after 30 seconds
        gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
      })),
    combine: results => {
      return {
        data: results
          .map(result => result.data)
          .flat(2)
          .filter(Boolean) as { asset: Asset; amount: string; chainId: string }[],
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
