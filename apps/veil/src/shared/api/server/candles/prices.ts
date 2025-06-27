'use server';

import { ChainRegistryClient } from '@penumbra-labs/registry';
import { pindexerDb } from '@/shared/database/client';
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

  // First, always include USDC at price 1 if requested
  if (symbols.some(s => s.toUpperCase() === 'USDC')) {
    out.push({
      baseAsset: { symbol: 'USDC' } as Metadata,
      quoteAsset: usdcMeta,
      price: 1,
    });
  }

  // Map symbols to metadata and AssetIds upfront
  const metaByIdHex = new Map<string, Metadata>();
  const assetIds: Buffer[] = [];

  for (const sym of symbols) {
    if (sym.toUpperCase() === 'USDC') {
      // already handled above
      continue;
    }
    const meta = allAssets.find(a => a.symbol?.toUpperCase() === sym.toUpperCase());
    if (!meta?.penumbraAssetId) {
      continue;
    }
    const buf = Buffer.from(meta.penumbraAssetId.inner);
    metaByIdHex.set(buf.toString('hex'), meta);
    assetIds.push(buf);
  }

  if (assetIds.length === 0) {
    return serialize(out);
  }

  // Single query to summary table for the latest price (1-minute window gives near-real-time close)
  const rows = await pindexerDb
    .selectFrom('dex_ex_pairs_summary')
    .select(['asset_start', 'price'])
    .where('the_window', '=', '1m')
    .where('asset_end', '=', Buffer.from(usdcMeta.penumbraAssetId.inner))
    .where('asset_start', 'in', assetIds)
    .execute();

  rows.forEach(row => {
    // Look up metadata via captured map
    const meta = metaByIdHex.get(Buffer.from(row.asset_start).toString('hex'));
    if (!meta) {
      return;
    }
    out.push({
      baseAsset: meta,
      quoteAsset: usdcMeta,
      price: typeof row.price === 'string' ? Number(row.price) : (row.price as number),
    });
  });

  return serialize(out);
}
