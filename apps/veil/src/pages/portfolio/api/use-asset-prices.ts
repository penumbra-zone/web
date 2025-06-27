import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/shared/utils/api-fetch';
import { SummaryData } from '@/shared/api/server/summary/types';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { useMemo } from 'react';
import { CandleWithVolume } from '@/shared/api/server/candles/utils';

export interface AssetPrice {
  symbol: string;
  price: number;
  quoteSymbol: string;
}

/**
 * Hook to fetch asset prices for a list of assets
 * Uses the same summaries API that the explore page uses
 * Only returns prices denominated in USDC
 */
export const useAssetPrices = (assets: Metadata[] = []) => {
  // Get symbols for searching
  const symbols = useMemo(() => assets.map(asset => asset.symbol).filter(Boolean), [assets]);

  // Query summaries API for price data
  const { data, isLoading, error } = useQuery({
    queryKey: ['asset-prices', symbols],
    queryFn: async () => {
      if (symbols.length === 0) {
        return [];
      }

      // TODO: This is inefficient. A batch endpoint should be created to fetch prices for multiple assets at once.
      // Fetch last candle for each symbol vs USDC to derive price.
      const promises = symbols.map(async sym => {
        if (sym.toUpperCase() === 'USDC') {
          return {
            baseAsset: { symbol: sym } as Metadata,
            quoteAsset: { symbol: 'USDC' } as Metadata,
            price: 1,
          } as SummaryData;
        }
        try {
          const candles = await apiFetch<CandleWithVolume[]>('/api/candles', {
            baseAsset: sym,
            quoteAsset: 'USDC',
            durationWindow: '1h',
          });
          const last =
            Array.isArray(candles) && candles.length > 0 ? candles[candles.length - 1] : undefined;
          if (last?.ohlc) {
            return {
              baseAsset: { symbol: sym } as Metadata,
              quoteAsset: { symbol: 'USDC' } as Metadata,
              price: last.ohlc.close,
            } as SummaryData;
          }
        } catch (_) {
          // This can fail if the pair doesn't exist, which is expected.
          // We can ignore this error and just won't have a price for this asset.
        }
        return undefined;
      });
      const results = (await Promise.all(promises)).filter(Boolean) as SummaryData[];
      return results;
    },
    staleTime: 60000, // 1 minute
    enabled: symbols.length > 0,
  });

  // TODO: this needs a rework to support any numeraire, not just USDC and USDY.
  // Process data to map symbols to prices
  const assetPrices: Record<string, AssetPrice> = useMemo(() => {
    if (!data) {
      return {};
    }

    const prices: Record<string, AssetPrice> = {};

    // Process direct USDC pairs first
    const usdcPairs = data.filter(
      summary => summary.quoteAsset.symbol === 'USDC' || summary.quoteAsset.symbol === 'usdc',
    );

    // Process USDC pairs to extract price information
    usdcPairs.forEach(summary => {
      if (summary.baseAsset.symbol) {
        prices[summary.baseAsset.symbol] = {
          symbol: summary.baseAsset.symbol,
          price: summary.price,
          quoteSymbol: 'USDC',
        };
      }
    });

    // If we have USDC in the data directly (as a base asset), it should have a price of 1 USDC
    if (!prices['USDC'] && symbols.includes('USDC')) {
      prices['USDC'] = {
        symbol: 'USDC',
        price: 1,
        quoteSymbol: 'USDC',
      };
    }

    // Process stable pairs for assets that don't have direct USDC pairs
    // First, find stablecoin-denominated pairs (USDT, UST, DAI, USDY, etc.)
    const stablePairs = data.filter(
      summary =>
        !usdcPairs.includes(summary) &&
        (summary.quoteAsset.symbol.includes('USD') ||
          summary.quoteAsset.symbol.includes('usdc') ||
          summary.quoteAsset.symbol.includes('usdt') ||
          summary.quoteAsset.symbol.includes('dai') ||
          summary.quoteAsset.symbol === 'DAI' ||
          summary.quoteAsset.symbol === 'USDY' ||
          summary.quoteAsset.symbol === 'USDT' ||
          summary.quoteAsset.symbol === 'CDT' ||
          summary.quoteAsset.symbol.includes('allUSD')),
    );

    // For assets without direct USDC prices, try to use stablecoin pairs
    // Assuming most USD-pegged stablecoins are ~1 USD
    stablePairs.forEach(summary => {
      if (summary.baseAsset.symbol && !prices[summary.baseAsset.symbol]) {
        prices[summary.baseAsset.symbol] = {
          symbol: summary.baseAsset.symbol,
          price: summary.price,
          quoteSymbol: summary.quoteAsset.symbol || 'USD',
        };
      }
    });

    // Look for USDY specifically since it might be in different pairs
    const usdyDirectPair = data.find(
      summary => summary.baseAsset.symbol === 'USDY' && summary.quoteAsset.symbol === 'USDC',
    );

    if (usdyDirectPair) {
      prices['USDY'] = {
        symbol: 'USDY',
        price: usdyDirectPair.price,
        quoteSymbol: 'USDC',
      };
    } else {
      // If USDY/USDC pair doesn't exist, check for pairs where USDY is the quote asset
      const usdyQuotePairs = data.filter(summary => summary.quoteAsset.symbol === 'USDY');

      if (usdyQuotePairs.length > 0) {
        // If we find pairs with USDY as quote, we can infer USDY is roughly 1 USDC
        prices['USDY'] = {
          symbol: 'USDY',
          price: 1,
          quoteSymbol: 'USDC',
        };
      }
    }

    return prices;
  }, [data, symbols]);

  return {
    prices: assetPrices,
    isLoading,
    error,
  };
};
