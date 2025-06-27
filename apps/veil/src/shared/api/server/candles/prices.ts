'use server';

import { ChainRegistryClient } from '@penumbra-labs/registry';
import { pindexer } from '@/shared/database';
import { serialize, Serialized } from '@/shared/utils/serializer';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { dbCandleToOhlc } from '@/shared/api/server/candles/utils';

export interface PriceEntry {
  baseAsset: Metadata;
  quoteAsset: Metadata;
  price: number;
}

/**
 * Fetch the latest close price for a list of asset symbols denominated in USDC.
 * The function returns the same `SummaryData` shape that `useAssetPrices` already expects.
 *
 * Note: The result is wrapped in the serializer so it can be safely shipped to the client.
 */
export async function fetchAssetPrices(symbols: string[]): Promise<Serialized<PriceEntry[]>> {
  if (symbols.length === 0) {
    return serialize([]);
  }

  const chainId = process.env['PENUMBRA_CHAIN_ID'];
  if (!chainId) {
    throw new Error('PENUMBRA_CHAIN_ID is not set');
  }

  // Fetch the registry once and reuse it for all look-ups.
  const registryClient = new ChainRegistryClient();
  const registry = await registryClient.remote.get(chainId);
  const allAssets = registry.getAllAssets();

  // Locate the canonical USDC metadata once.
  const usdcMeta = allAssets.find(a => a.symbol?.toUpperCase() === 'USDC');
  if (!usdcMeta?.penumbraAssetId) {
    throw new Error('USDC asset not found in registry');
  }

  const out: PriceEntry[] = [];
  for (const sym of symbols) {
    // Handle USDC itself explicitly – price is always 1.
    if (sym.toUpperCase() === 'USDC') {
      out.push({
        baseAsset: { symbol: sym } as Metadata,
        quoteAsset: { symbol: 'USDC' } as Metadata,
        price: 1,
      });
      continue;
    }

    const baseMeta = allAssets.find(a => a.symbol?.toUpperCase() === sym.toUpperCase());
    if (!baseMeta?.penumbraAssetId) {
      // Skip assets we can't resolve.
      continue;
    }

    // Fetch the last candle for the pair base/USDC over the 1h window.
    const candles = await pindexer.candles({
      baseAsset: baseMeta.penumbraAssetId,
      quoteAsset: usdcMeta.penumbraAssetId,
      window: '1h',
      chainId,
    });

    if (candles.length === 0) {
      continue;
    }

    const last = candles[candles.length - 1];
    const priceData = dbCandleToOhlc(last, baseMeta, usdcMeta);

    out.push({
      baseAsset: baseMeta,
      quoteAsset: usdcMeta,
      price: priceData.ohlc.close,
    });
  }

  return serialize(out);
}
