import { useCosmosBalances, CosmosBalance } from './use-cosmos-balances';
import { Metadata, ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { useMemo } from 'react';
import { useWallet } from '@cosmos-kit/react';
import { WalletStatus } from '@cosmos-kit/core';
import { pnum } from '@penumbra-zone/types/pnum';
import { assetPatterns } from '@penumbra-zone/types/assets';
import { BalancesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';

// Use simple interfaces like Veil
export interface ShieldedBalance {
  valueView: ValueView;
  balance: BalancesResponse;
}

export interface PublicBalance {
  chainId: string;
  denom: string;
  valueView: ValueView;
}

export interface UnifiedAsset {
  // Common asset information
  symbol: string;
  metadata: Metadata; // Display metadata (name, icon, etc.)

  // Balances
  shieldedBalances: ShieldedBalance[];
  publicBalances: PublicBalance[];
}

const normalizeSymbol = (symbol: string): string => {
  return symbol.toLowerCase().replace(/[^a-z0-9]/g, '');
};

const getPublicBalanceKey = (chainId: string, denom: string): string => {
  return `${chainId}:${denom}`;
};

export const shouldFilterAsset = (symbol: string): boolean => {
  return [
    assetPatterns.lpNft,
    assetPatterns.auctionNft,
    assetPatterns.unbondingToken,
    assetPatterns.votingReceipt,
    assetPatterns.proposalNft,
    assetPatterns.delegationToken,
  ].some(pattern => pattern.matches(symbol));
};

/**
 * Hook that combines Penumbra (shielded) and Cosmos (public) balances into a unified asset structure.
 * Based on Veil's useUnifiedAssets approach but simplified for minifront-v2.
 */
export const useUnifiedAssets = () => {
  const { status: cosmosWalletStatus } = useWallet();

  // For now, we'll focus on Cosmos balances since Penumbra balances are handled elsewhere
  // TODO: Add Penumbra balances integration when needed
  const penumbraBalances: BalancesResponse[] = [];
  const penumbraLoading = false;

  const { balances: cosmosBalances = [], isLoading: cosmosLoading } = useCosmosBalances();

  // Check connection status
  const isPenumbraConnected = false; // TODO: Get from Penumbra connection store
  const isCosmosConnected = cosmosWalletStatus === WalletStatus.Connected;

  const publicAssets = useMemo(() => {
    if (!isCosmosConnected || !cosmosBalances.length) {
      return [];
    }

    return cosmosBalances
      .map(({ asset, amount, chainId }: CosmosBalance) => {
        try {
          const metadata = new Metadata({
            base: asset.base,
            display: asset.display,
            denomUnits: asset.denom_units,
            symbol: asset.symbol,
            penumbraAssetId: { inner: new Uint8Array([1]) },
            coingeckoId: asset.coingecko_id,
            images: asset.images,
            name: asset.name,
            description: asset.description,
          });

          const valueView = new ValueView({
            valueView: {
              case: 'knownAssetId',
              value: {
                amount: pnum(amount).toAmount(),
                metadata,
                equivalentValues: [],
              },
            },
          });

          const unifiedAsset = {
            symbol: asset.symbol,
            metadata,
            shieldedBalances: [],
            publicBalances: [
              {
                chainId,
                denom: asset.base,
                valueView,
              },
            ],
          } as UnifiedAsset;
          return unifiedAsset;
        } catch (error: unknown) {
          console.error('❌ Error processing Cosmos balance', error, { asset, amount, chainId });
          return null;
        }
      })
      .filter(Boolean) as UnifiedAsset[];
  }, [cosmosBalances, isCosmosConnected]);

  const unifiedAssets = useMemo(() => {
    const assetMap = new Map<string, UnifiedAsset>();

    // Process public assets (cosmos balances)
    if (isCosmosConnected) {
      publicAssets.forEach(asset => {
        const key = normalizeSymbol(asset.symbol);
        const existing = assetMap.get(key);

        if (existing) {
          // Merge with existing asset by combining the public balances
          const balanceKeys = new Set<string>();

          // Add keys for existing balances
          existing.publicBalances.forEach(balance => {
            balanceKeys.add(getPublicBalanceKey(balance.chainId, balance.denom));
          });

          // Only add public balances that don't already exist
          asset.publicBalances.forEach(balance => {
            const balanceKey = getPublicBalanceKey(balance.chainId, balance.denom);
            if (!balanceKeys.has(balanceKey)) {
              existing.publicBalances.push(balance);
              balanceKeys.add(balanceKey);
            }
          });
        } else {
          // Add new public-only asset
          assetMap.set(key, asset);
        }
      });
    }

    // Convert to array
    return Array.from(assetMap.values());
  }, [publicAssets, isCosmosConnected]);

  // Calculate totals (simplified for now)
  const totalShieldedValue = useMemo(() => {
    return 0; // TODO: Implement when prices are available
  }, []);

  const totalPublicValue = useMemo(() => {
    return 0; // TODO: Implement when prices are available
  }, []);

  const totalValue = useMemo(() => {
    return totalShieldedValue + totalPublicValue;
  }, [totalShieldedValue, totalPublicValue]);

  // Loading state - only show loading when we have no data and something is loading
  const isLoading = unifiedAssets.length === 0 && (penumbraLoading || cosmosLoading);

  return {
    unifiedAssets,
    totalShieldedValue,
    totalPublicValue,
    totalValue,
    isLoading,
    isPenumbraConnected,
    isCosmosConnected,
  };
};
