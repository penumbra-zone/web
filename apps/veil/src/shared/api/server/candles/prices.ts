'use server';

import { ChainRegistryClient } from '@penumbra-labs/registry';
import { pindexerDb } from '@/shared/database/client';
import { serialize, Serialized } from '@/shared/utils/serializer';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';

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

  const out: PriceEntry[] = [];

  // Helper: classify if an asset is considered a stablecoin (USD-pegged or basket)
  const isStable = (sym: string): boolean => /USD|USDT|USDC|USDY|DAI|CDT|allUSD/i.test(sym);

  // Quick look-up helpers
  const metaBySymbol = new Map<string, Metadata>();
  allAssets.forEach(a => {
    if (a.symbol) {
      metaBySymbol.set(a.symbol.toUpperCase(), a);
    }
  });

  const metaByIdHex = new Map<string, Metadata>();
  const assetIds: Buffer[] = [];

  for (const sym of symbols) {
    const meta = metaBySymbol.get(sym.toUpperCase());
    if (!meta?.penumbraAssetId) {
      continue;
    }
    const buf = Buffer.from(meta.penumbraAssetId.inner);
    metaByIdHex.set(buf.toString('hex'), meta);
    assetIds.push(buf);
  }

  // ------------------------------------------------------------------
  // 1) Return price = 1 for stablecoins themselves
  // ------------------------------------------------------------------
  const usdcMeta = metaBySymbol.get('USDC');
  symbols.forEach(sym => {
    if (!isStable(sym)) {
      return;
    }
    const meta = metaBySymbol.get(sym.toUpperCase());
    if (!meta) {
      return;
    }
    out.push({ baseAsset: meta, quoteAsset: usdcMeta ?? meta, price: 1 });
  });

  if (assetIds.length === 0) {
    // No non-stable assets requested; we are done.
    return serialize(out);
  }

  const rows = await pindexerDb
    .selectFrom('dex_ex_pairs_summary')
    .select(['asset_start', 'asset_end', 'price'])
    .where('the_window', '=', '1m')
    .where('asset_start', 'in', assetIds.length ? assetIds : [Buffer.alloc(0)]) // prevent empty IN ()
    .execute();

  // Choose the best stable-quote per base asset (priority list)
  const priority: Record<string, number> = { USDC: 6, USDY: 5, USDT: 4, DAI: 3, CDT: 2 };

  const bestByAsset = new Map<string, { quote: Metadata; price: number }>();

  rows.forEach(row => {
    const baseMeta = metaByIdHex.get(Buffer.from(row.asset_start).toString('hex'));
    if (!baseMeta) {
      return;
    }

    const quoteMeta = allAssets.find(m => {
      if (!m.penumbraAssetId) {
        return false;
      }
      return Buffer.from(m.penumbraAssetId.inner).equals(row.asset_end);
    });
    if (!quoteMeta?.penumbraAssetId) {
      return;
    }

    if (!baseMeta.symbol) {
      return;
    }
    const baseKey = baseMeta.symbol.toUpperCase();
    const quoteKey = quoteMeta.symbol.toUpperCase();

    const incomingPrio = priority[quoteKey] ?? 1;
    const existing = bestByAsset.get(baseKey);
    const currentPrio = existing ? (priority[existing.quote.symbol.toUpperCase()] ?? 1) : -1;

    if (incomingPrio > currentPrio) {
      bestByAsset.set(baseKey, {
        quote: quoteMeta,
        price: typeof row.price === 'string' ? Number(row.price) : row.price,
      });
    }
  });

  bestByAsset.forEach(({ quote, price }, baseKey) => {
    const baseMeta = metaBySymbol.get(baseKey);
    if (!baseMeta) {
      return;
    }
    out.push({ baseAsset: baseMeta, quoteAsset: quote, price });
  });

  return serialize(out);
}
