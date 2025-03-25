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
import { getStablecoins } from '@/shared/utils/stables';

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

  const { stablecoins } = getStablecoins(allAssets, 'USDC');

  const results = await pindexer.pairs({
    stablecoins: stablecoins.map(asset => asset.penumbraAssetId) as AssetId[],
  });

  const pairs = (await Promise.all(
    results.map(summary => {
      const baseAsset = registry.tryGetMetadata(new AssetId({ inner: summary.asset_start }));
      const quoteAsset = registry.tryGetMetadata(new AssetId({ inner: summary.asset_end }));
      if (!baseAsset || !quoteAsset) {
        return undefined;
      }

      const volume = toValueView({
        amount: Math.max(Math.floor(summary.direct_volume_indexing_denom_over_window), 0.0),
        metadata: quoteAsset,
      });

      return serialize({
        baseAsset,
        quoteAsset,
        volume,
      });
    }),
  )) as Serialized<PairData>[];

  return NextResponse.json(pairs.filter(Boolean));
}
