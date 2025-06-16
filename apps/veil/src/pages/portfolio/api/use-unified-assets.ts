import { useBalances as useCosmosBalances } from '@/features/cosmos/use-augmented-balances';
import { connectionStore } from '@/shared/model/connection';
import {
  getBalanceView,
  getMetadataFromBalancesResponse,
} from '@penumbra-zone/getters/balances-response';
import { Metadata, ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { useMemo } from 'react';
import { useAssetPrices } from './use-asset-prices.ts';
import { useWallet } from '@cosmos-kit/react';
import { WalletStatus } from '@cosmos-kit/core';
import { useBalances as usePenumbraBalances } from '@/shared/api/balances';
import { pnum } from '@penumbra-zone/types/pnum';
import { assetPatterns } from '@penumbra-zone/types/assets';
import { BalancesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';

/**
 * Interface representing a unified asset with both shielded and public balances
 */
export interface UnifiedAsset {
  // Common asset information
  symbol: string;
  metadata: Metadata; // Display metadata (name, icon, etc.)

  // Balances
  shieldedBalances: ShieldedBalance[];
  publicBalances: PublicBalance[];
}

export interface ShieldedBalance {
  valueView: ValueView; // Penumbra ValueView for consistent display
  balance: BalancesResponse;
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
  const { status: cosmosWalletStatus } = useWallet();

  const { data: penumbraBalances = [], isLoading: penumbraLoading } =
    usePenumbraBalances(penumbraAccountIndex);
  const { balances: cosmosBalances = [], isLoading: cosmosLoading } = useCosmosBalances();

  // Check connection status (must be calculated before hooks below use it)
  const isPenumbraConnected = connectionStore.connected;
  const isCosmosConnected = cosmosWalletStatus === WalletStatus.Connected;

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

  // eslint-disable-next-line react-hooks/exhaustive-deps -- `isPenumbraConnected` comes from a reactive store; we still include it in the deps array to satisfy lint rules
  const shieldedAssets = useMemo(() => {
    if (!isPenumbraConnected || !penumbraBalances.length) {
      return [];
    }

    return penumbraBalances
      .filter(balance => {
        return balance.balanceView?.valueView.case === 'knownAssetId';
      })
      .filter(balance => {
        const metadata = getMetadataFromBalancesResponse(balance);
        return !shouldFilterAsset(metadata.display);
      })
      .map(balance => {
        try {
          const metadata = getMetadataFromBalancesResponse(balance);
          const valueView = getBalanceView(balance);

          // Create an asset object with a new structure
          return {
            symbol: metadata.symbol,
            metadata,
            shieldedBalances: [
              {
                valueView,
                balance,
              },
            ],
            publicBalances: [],
          } as UnifiedAsset;
        } catch (error: unknown) {
          console.error('Error processing Penumbra balance', error);
          return null;
        }
      })
      .filter(Boolean) as UnifiedAsset[];
  }, [isPenumbraConnected, penumbraBalances]);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- `isCosmosConnected` is a derived boolean; included in deps for clarity
  const publicAssets = useMemo(() => {
    if (!isCosmosConnected || !cosmosBalances.length) {
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
        } catch (error: unknown) {
          console.error('Error processing Cosmos balance', error);
          return null;
        }
      })
      .filter(Boolean) as UnifiedAsset[];
  }, [cosmosBalances, isCosmosConnected]);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- depends on connection status for merging logic
  const unifiedAssets = useMemo(() => {
    const assetMap = new Map<string, UnifiedAsset>();

    // Process shielded assets first
    shieldedAssets.forEach(asset => {
      const key = normalizeSymbol(asset.symbol);
      assetMap.set(key, asset);
    });

    // If Cosmos wallet is connected, merge in public assets
    if (isCosmosConnected) {
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
    } else {
      // When Cosmos wallet is disconnected, ensure all public balances are cleared
      assetMap.forEach(asset => {
        asset.publicBalances = [];
      });
    }

    // Convert to array
    return Array.from(assetMap.values());
  }, [shieldedAssets, publicAssets, isCosmosConnected]);

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

  // -------------------------------------------------------------
  // Loading state handling
  // -------------------------------------------------------------
  // We want to avoid showing the global loading placeholder once
  // we already have some data to render (e.g. Penumbra assets).
  // Therefore, the hook reports `isLoading` **only** when we have
  // no unified assets yet *and* at least one of the underlying
  // queries is still in flight. This prevents the UI from
  // temporarily switching back to the loading skeleton when a
  // secondary data-source (like Cosmos balances) starts fetching
  // after the initial Penumbra data has been rendered.
  //
  // Note: `isLoading` must be defined after `unifiedAssets` so we
  // can rely on its length to determine whether we already have
  // something to display.
  // -------------------------------------------------------------
  const isLoading =
    unifiedAssets.length === 0 && (penumbraLoading || cosmosLoading || pricesLoading);

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
