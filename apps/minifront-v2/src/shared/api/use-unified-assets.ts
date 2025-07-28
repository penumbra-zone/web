import { useCosmosBalances, CosmosBalance } from './use-cosmos-balances';
import { Metadata, ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { useMemo, useEffect } from 'react';
import { useWallet } from '@cosmos-kit/react';
import { WalletStatus } from '@cosmos-kit/core';
import { pnum } from '@penumbra-zone/types/pnum';
import { assetPatterns } from '@penumbra-zone/types/assets';
import { BalancesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { useBalancesStore } from '../stores/store-context';
import {
  getMetadataFromBalancesResponse,
  getBalanceView,
} from '@penumbra-zone/getters/balances-response';

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
  symbol: string;
  metadata: Metadata;
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
 */
export const useUnifiedAssets = () => {
  const { status: cosmosWalletStatus } = useWallet();

  const balancesStore = useBalancesStore();
  const penumbraBalances = balancesStore.balancesResponses;
  const penumbraLoading = balancesStore.loading;

  const { balances: cosmosBalances = [], isLoading: cosmosLoading } = useCosmosBalances();

  useEffect(() => {
    if (penumbraBalances.length === 0 && !penumbraLoading) {
      void balancesStore.loadAllAccountBalances();
    }
  }, [balancesStore, penumbraBalances.length, penumbraLoading]);

  const isPenumbraConnected = penumbraBalances.length > 0 || !penumbraLoading;
  const isCosmosConnected = cosmosWalletStatus === WalletStatus.Connected;

  const shouldFilterAsset = (symbol: string): boolean => {
    return [
      assetPatterns.lpNft,
      assetPatterns.auctionNft,
      assetPatterns.unbondingToken,
      assetPatterns.votingReceipt,
      assetPatterns.proposalNft,
      assetPatterns.delegationToken,
    ].some(pattern => pattern.matches(symbol));
  };

  const shieldedAssets = useMemo(() => {
    if (!isPenumbraConnected || !penumbraBalances.length) {
      return [];
    }

    const assetMap = new Map<string, UnifiedAsset>();

    penumbraBalances
      .filter(balance => {
        return balance.balanceView?.valueView.case === 'knownAssetId';
      })
      .filter(balance => {
        const metadata = getMetadataFromBalancesResponse(balance);
        return !shouldFilterAsset(metadata.symbol);
      })
      .forEach(balance => {
        try {
          const metadata = getMetadataFromBalancesResponse(balance);
          const valueView = getBalanceView(balance);
          const symbol = metadata.symbol;

          const existingAsset = assetMap.get(symbol);
          if (existingAsset) {
            existingAsset.shieldedBalances.push({
              valueView,
              balance,
            });
          } else {
            const newAsset: UnifiedAsset = {
              symbol,
              metadata,
              shieldedBalances: [
                {
                  valueView,
                  balance,
                },
              ],
              publicBalances: [],
            };
            assetMap.set(symbol, newAsset);
          }
        } catch (error: unknown) {
          console.error('Error processing Penumbra balance', error);
        }
      });

    return Array.from(assetMap.values());
  }, [isPenumbraConnected, penumbraBalances]);

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
          console.error('Error processing Cosmos balance', error, { asset, amount, chainId });
          return null;
        }
      })
      .filter(Boolean) as UnifiedAsset[];
  }, [cosmosBalances, isCosmosConnected]);

  const unifiedAssets = useMemo(() => {
    const assetMap = new Map<string, UnifiedAsset>();

    shieldedAssets.forEach(asset => {
      const key = normalizeSymbol(asset.symbol);
      assetMap.set(key, asset);
    });

    if (isCosmosConnected) {
      publicAssets.forEach(asset => {
        const key = normalizeSymbol(asset.symbol);
        const existing = assetMap.get(key);

        if (existing) {
          const balanceKeys = new Set<string>();

          existing.publicBalances.forEach(balance => {
            balanceKeys.add(getPublicBalanceKey(balance.chainId, balance.denom));
          });

          asset.publicBalances.forEach(balance => {
            const balanceKey = getPublicBalanceKey(balance.chainId, balance.denom);
            if (!balanceKeys.has(balanceKey)) {
              existing.publicBalances.push(balance);
              balanceKeys.add(balanceKey);
            }
          });
        } else {
          assetMap.set(key, asset);
        }
      });
    } else {
      assetMap.forEach(asset => {
        asset.publicBalances = [];
      });
    }

    return Array.from(assetMap.values());
  }, [shieldedAssets, publicAssets, isCosmosConnected]);

  const totalShieldedValue = useMemo(() => {
    return 0; // TODO: Implement when prices are available
  }, []);

  const totalPublicValue = useMemo(() => {
    return 0; // TODO: Implement when prices are available
  }, []);

  const totalValue = useMemo(() => {
    return totalShieldedValue + totalPublicValue;
  }, [totalShieldedValue, totalPublicValue]);

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
