import { NextResponse } from 'next/server';
import { pindexer } from '@/shared/database';
import { serialize, Serialized } from '@/shared/utils/serializer';
import {
  AssetId,
  Metadata,
  ValueView,
} from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { ChainRegistryClient } from '@penumbra-labs/registry';
import { toValueView } from '@/shared/utils/value-view';
import { getDisplayDenomExponent } from '@penumbra-zone/getters/metadata';

const getAssetById = (allAssets: Metadata[], id: Buffer): Metadata | undefined => {
  return allAssets.find(asset => {
    return asset.penumbraAssetId?.equals(new AssetId({ inner: id }));
  });
};

export interface PairData {
  baseAsset: Metadata;
  quoteAsset: Metadata;
  volume: ValueView;
}

export type PairsResponse = Serialized<PairData>[] | { error: string };

export async function GET(): Promise<NextResponse<PairsResponse>> {
  const chainId = process.env['PENUMBRA_CHAIN_ID'];
  if (!chainId) {
    return NextResponse.json({ error: 'PENUMBRA_CHAIN_ID is not set' }, { status: 500 });
  }

  const registryClient = new ChainRegistryClient();
  const registry = await registryClient.remote.get(chainId);
  const allAssets = registry.getAllAssets();

  const stablecoins = allAssets.filter(asset => ['USDT', 'USDC', 'USDY'].includes(asset.symbol));
  const usdc = stablecoins.find(asset => asset.symbol === 'USDC');

  const results = await pindexer.pairs({
    // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style -- usdc is defined
    usdc: usdc?.penumbraAssetId as AssetId,
    stablecoins: stablecoins.map(asset => asset.penumbraAssetId) as AssetId[],
  });

  const pairs = (await Promise.all(
    results.map(summary => {
      const baseAsset = getAssetById(allAssets, summary.asset_start);
      const quoteAsset = getAssetById(allAssets, summary.asset_end);
      if (!baseAsset || !quoteAsset) {
        return undefined;
      }

      // TODO: should this be `direct_volume_over_window`?
      let volume = toValueView({
        amount: summary.liquidity,
        metadata: quoteAsset,
      });

      // Converts liquidity and trading volume to their equivalent USDC prices if `usdc_price` is available
      if (summary.usdc_price) {
        const expDiff = Math.abs(
          getDisplayDenomExponent(quoteAsset) - getDisplayDenomExponent(usdc),
        );
        const result = summary.liquidity * summary.usdc_price * 10 ** expDiff;
        volume = toValueView({
          amount: Math.floor(result),
          metadata: quoteAsset,
        });
      }

      return serialize({
        baseAsset,
        quoteAsset,
        volume,
      });
    }),
  )) as Serialized<PairData>[];

  return NextResponse.json(pairs.filter(Boolean));
}
