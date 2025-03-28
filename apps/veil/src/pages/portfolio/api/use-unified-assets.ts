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
  assetId?: string; // Penumbra asset ID if available
  metadata: Metadata; // Display metadata (name, icon, etc.)

  // Balances
  shieldedBalance: {
    amount: string;
    valueView: ValueView; // Penumbra ValueView for consistent display
    hasError: boolean;
  } | null;

  publicBalance: {
    amount: string;
    denom: string;
    chain?: string; // Source chain information
    valueView?: ValueView; // Converted to ValueView format
    hasError: boolean;
  } | null;

  // Values (priced in USD or stablecoin)
  shieldedValue: number;
  publicValue: number;
  totalValue: number;

  // Capabilities
  canDeposit: boolean;
  canWithdraw: boolean;
  originChain?: string; // Origin chain for deposit/withdraw operations
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
 * Determines if an asset can be deposited to Penumbra based on IBC denoms
 */
// @ts-expect-error -- TODO: will be useful later
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- will be useful later
const canDepositToPenumbra = (symbol: string, ibcDenoms: string[]): boolean => {
  /*  TODO: can deposit to penumbra == has an IBC to penumbra - this can be decided from the ibc connections in the penumbra registry */
  return ibcDenoms.some(denom => denom.includes(symbol));
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
    ...penumbraBalances.map(getMetadataFromBalancesResponse),
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
        const metadata = getMetadataFromBalancesResponse(balance);
        return !shouldFilterAsset(metadata.display);
      })
      .map(balance => {
        try {
          const metadata = getMetadataFromBalancesResponse(balance);
          const valueView = getBalanceView(balance);

          // Get price information
          const priceData = prices[metadata.symbol]?.price ?? 0;

          const numericAmount = pnum(valueView).toNumber();

          const assetValue = numericAmount * priceData;

          // Create asset object
          return {
            symbol: metadata.symbol,
            assetId: metadata.penumbraAssetId?.inner.toString(),
            metadata,
            shieldedBalance: {
              amount: numericAmount.toString(),
              valueView,
              hasError: false,
            },
            publicBalance: null,
            shieldedValue: assetValue,
            publicValue: 0,
            totalValue: assetValue,
            canDeposit: false,
            canWithdraw: true,
          };
        } catch (error) {
          console.error('Error processing Penumbra balance', error);
          return null;
        }
      })
      .filter(Boolean) as UnifiedAsset[];
  }, [isPenumbraConnected, penumbraBalances, prices]);

  // Create unified assets from Cosmos (public) balances
  const publicAssets = useMemo(() => {
    if (!isCosmosConnected || !cosmosBalances.length || !registry) {
      return [];
    }

    /* TODO: this should just match the assets to the asset registry from cosmos and maybe penumbra. no need for shenanigans.
     *  also: simplify filtering and connection checking
     * - use pnum as much as possible = keep the numbers in pnum for as long as possible
     * - check and write tests for prices sourcing. is there a simpler way?
     * - write integration tests for the crucial calculations, with real data from different chains and assets */

    return cosmosBalances
      .map(balance => {
        const { asset, amount } = balance;
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

          // Get price information
          const priceData = prices[metadata.symbol]?.price ?? 0;

          const numericAmount = pnum(valueView).toNumber();

          const assetValue = numericAmount * priceData;

          // Create asset object
          return {
            symbol: asset.symbol,
            assetId: '',
            metadata,
            shieldedBalance: null,
            publicBalance: {
              amount: pnum(amount).toString(),
              denom: asset.ibc?.source_denom,
              chain: 'CHAIN',
              valueView,
              hasError: false,
            },
            shieldedValue: 0,
            publicValue: assetValue,
            totalValue: assetValue,
            canDeposit: true,
            canWithdraw: false,
            originChain: '',
          };
        } catch (error) {
          console.error('Error processing Cosmos balance', error);
          return null;
        }
      })
      .filter(Boolean) as UnifiedAsset[];
  }, [isCosmosConnected, cosmosBalances, registry, prices]);

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
        // Merge with existing shielded asset
        existing.publicBalance = asset.publicBalance;
        existing.publicValue = asset.publicValue;
        existing.totalValue = existing.shieldedValue + asset.publicValue;
        existing.canDeposit = asset.canDeposit;
        existing.originChain = asset.originChain;
      } else {
        // Add new public-only asset
        assetMap.set(key, asset);
      }
    });

    // Convert to array and sort by total value
    return Array.from(assetMap.values()).sort((a, b) => b.totalValue - a.totalValue);
  }, [shieldedAssets, publicAssets]);

  // Calculate totals
  const totalShieldedValue = useMemo(() => {
    return unifiedAssets.reduce((total, asset) => total + asset.shieldedValue, 0);
  }, [unifiedAssets]);

  const totalPublicValue = useMemo(() => {
    return unifiedAssets.reduce((total, asset) => total + asset.publicValue, 0);
  }, [unifiedAssets]);

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
