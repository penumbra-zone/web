import { useBalances as useCosmosBalances } from '@/features/cosmos/use-augmented-balances';
import { useRegistry } from '@/shared/api/registry';
import { connectionStore } from '@/shared/model/connection';
import {
  getMetadataFromBalancesResponse,
  getBalanceView,
} from '@penumbra-zone/getters/balances-response';
import { ValueView, Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { useMemo } from 'react';
import { useAssetPrices } from './use-asset-prices.ts';
import { useWallet } from '@cosmos-kit/react';
import { WalletStatus } from '@cosmos-kit/core';
import { useBalances as usePenumbraBalances } from '@/shared/api/balances';
import { pnum } from '@penumbra-zone/types/pnum';
import { assetPatterns } from '@penumbra-zone/types/assets';

/**
 * Interface representing a unified asset with both shielded and public balances
 */
export interface UnifiedAsset {
  // Common asset information
  symbol: string;
  metadata: Metadata; // Display metadata (name, icon, etc.)

  // Balances
  shieldedBalances: {
    valueView: ValueView; // Penumbra ValueView for consistent display
  }[];

  publicBalances: PublicBalance[];
}

export interface PublicBalance {
  chainId: string; // where this particular balance comes from
  denom: string; // ibc denom, including channel
  valueView: ValueView; // Converted to ValueView format
}

const normalizeSymbol = (symbol: string): string => {
  return symbol.toLowerCase();
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
 * Creates a unique key for a public balance using chainId and denom
 */
const getPublicBalanceKey = (chainId: string, denom: string): string => {
  return `${chainId}:${denom}`;
};

/**
 * Hook that combines Penumbra (shielded) and Cosmos (public) balances into a unified asset structure.
 */
export const useUnifiedAssets = () => {
  const { subaccount: penumbraAccountIndex } = connectionStore;
  const { data: penumbraBalances = [], isLoading: penumbraLoading } =
    usePenumbraBalances(penumbraAccountIndex);
  const { balances: cosmosBalances = [], isLoading: cosmosLoading } = useCosmosBalances();
  const { status: cosmosWalletStatus } = useWallet();

  const { data: registry, isLoading: registryLoading } = useRegistry();
  const filteredAssetSymbols = [
    ...penumbraBalances
      .map(getMetadataFromBalancesResponse.optional)
      .filter((m): m is Metadata => m !== undefined),
    ...cosmosBalances.map(
      ({ asset }) =>
        new Metadata({
          base: asset.base,
          display: asset.display,
          denomUnits: asset.denom_units,
          symbol: asset.symbol,
          penumbraAssetId: { inner: new Uint8Array([1]) },
          coingeckoId: asset.coingecko_id,
          images: asset.images,
          name: asset.name,
          description: asset.description,
        }),
    ),
  ];
  const { prices, isLoading: pricesLoading } = useAssetPrices(filteredAssetSymbols);

  // Determine if we're ready to process data
  const isLoading = penumbraLoading || cosmosLoading || registryLoading || pricesLoading;

  // Check connection status
  const isPenumbraConnected = connectionStore.connected;
  const isCosmosConnected = cosmosWalletStatus === WalletStatus.Connected;

  const shieldedAssets = useMemo(() => {
    if (!isPenumbraConnected || !penumbraBalances.length) {
      return [];
    }

    return penumbraBalances
      .filter(balance => {
        const isKnownAsset = balance.balanceView?.valueView.case === 'knownAssetId';
        if (!isKnownAsset) {
          return false;
        }
        return true;
      })
      .filter(balance => {
        const metadata = getMetadataFromBalancesResponse(balance);
        return !shouldFilterAsset(metadata.display);
      })
      .map(balance => {
        try {
          const metadata = getMetadataFromBalancesResponse(balance);
          const valueView = getBalanceView(balance);

          // Create asset object with new structure
          return {
            symbol: metadata.symbol,
            metadata,
            shieldedBalances: [
              {
                valueView,
              },
            ],
            publicBalances: [],
          } as UnifiedAsset;
        } catch (error) {
          console.error('Error processing Penumbra balance', error);
          return null;
        }
      })
      .filter(Boolean) as UnifiedAsset[];
  }, [isPenumbraConnected, penumbraBalances]);

  // Create unified assets from Cosmos (public) balances
  const publicAssets = useMemo(() => {
    if (!isCosmosConnected || !cosmosBalances.length || !registry) {
      return [];
    }

    return cosmosBalances
      .map(({ asset, amount, chainId }) => {
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

          // Create asset object with new structure
          return {
            symbol: asset.symbol,
            metadata,
            shieldedBalances: [],
            publicBalances: [
              {
                chainId,
                denom: asset.ibc?.source_denom ?? asset.base,
                valueView,
              },
            ],
          } as UnifiedAsset;
        } catch (error) {
          console.error('Error processing Cosmos balance', error);
          return null;
        }
      })
      .filter(Boolean) as UnifiedAsset[];
  }, [isCosmosConnected, cosmosBalances, registry]);

  // Merge shielded and public assets
  const unifiedAssets = useMemo(() => {
    const assetMap = new Map<string, UnifiedAsset>();

    // Process shielded assets first
    shieldedAssets.forEach(asset => {
      const key = normalizeSymbol(asset.symbol);
      assetMap.set(key, asset);
    });

    // Merge in public assets
    publicAssets.forEach(asset => {
      const key = normalizeSymbol(asset.symbol);
      const existing = assetMap.get(key);

      if (existing) {
        // Merge with existing asset by combining the public balances
        // but deduplicating by chainId+denom combination
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

    // Convert to array
    return Array.from(assetMap.values());
  }, [shieldedAssets, publicAssets]);

  // Calculate totals based on prices
  const totalShieldedValue = useMemo(() => {
    return unifiedAssets.reduce((total, asset) => {
      const assetShieldedValue = asset.shieldedBalances.reduce((sum, balance) => {
        const numericAmount = pnum(balance.valueView).toNumber();
        const priceData = prices[asset.symbol]?.price ?? 0;
        return sum + numericAmount * priceData;
      }, 0);
      return total + assetShieldedValue;
    }, 0);
  }, [unifiedAssets, prices]);

  const totalPublicValue = useMemo(() => {
    return unifiedAssets.reduce((total, asset) => {
      const assetPublicValue = asset.publicBalances.reduce((sum, balance) => {
        const numericAmount = pnum(balance.valueView).toNumber();
        const priceData = prices[asset.symbol]?.price ?? 0;
        return sum + numericAmount * priceData;
      }, 0);
      return total + assetPublicValue;
    }, 0);
  }, [unifiedAssets, prices]);

  const totalValue = useMemo(() => {
    return totalShieldedValue + totalPublicValue;
  }, [totalShieldedValue, totalPublicValue]);

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
