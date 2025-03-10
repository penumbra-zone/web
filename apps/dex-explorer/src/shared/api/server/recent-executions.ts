import BigNumber from 'bignumber.js';
import { NextRequest, NextResponse } from 'next/server';
import { ChainRegistryClient, Registry } from '@penumbra-labs/registry';
import { AssetId } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { pnum } from '@penumbra-zone/types/pnum';
import { serialize, Serialized } from '@/shared/utils/serializer';
import { pindexer } from '@/shared/database';
import { getDisplayDenomExponent } from '@penumbra-zone/getters/metadata';

type FromPromise<T> = T extends Promise<(infer U)[]> ? U : T;
type RecentExecutionData = FromPromise<ReturnType<typeof pindexer.recentExecutions>>;

export type RecentExecutionsResponse = RecentExecution[] | { error: string };

export interface RecentExecution {
  kind: 'buy' | 'sell';
  amount: string;
  price: string;
  timestamp: string;
  hops: string[];
}

const DECIMALS = 4;

export const transformData = (
  data: RecentExecutionData,
  direction: 'buy' | 'sell',
  registry: Registry,
): RecentExecution => {
  const baseAssetId = new AssetId({
    inner: Uint8Array.from(data.asset_start),
  });
  const baseMetadata = registry.getMetadata(baseAssetId);
  const baseExponent = getDisplayDenomExponent.optional(baseMetadata) ?? 0;

  const quoteAssetId = new AssetId({ inner: Uint8Array.from(data.asset_end) });
  const quoteMetadata = registry.getMetadata(quoteAssetId);
  const quoteExponent = getDisplayDenomExponent.optional(quoteMetadata) ?? 0;

  const timestamp = data.time.toISOString();

  // When we go from quote to base, we need to invert the price.
  // This makes sense: a UX-friendly price is always denominated in quote assets.
  let priceNum: number;
  if (direction === 'sell') {
    priceNum = data.price_float;
  } else {
    priceNum = data.price_float === 0 ? 0 : 1 / data.price_float;
  }

  const exponentDifference =
    direction === 'sell' ? baseExponent - quoteExponent : quoteExponent - baseExponent;
  const price = new BigNumber(priceNum).shiftedBy(exponentDifference).toFormat(DECIMALS);

  const amount = pnum(
    // convert string to bigint so that pnum parses it in base units
    // which means we can use the exponent to format it in display units
    BigInt(direction === 'sell' ? data.input : data.output),
    direction === 'sell' ? baseExponent : quoteExponent,
  ).toFormattedString({
    decimals: DECIMALS,
  });

  const hops = data.asset_hops
    .map(buffer => {
      const assetId = new AssetId({ inner: Uint8Array.from(buffer) });
      return registry.tryGetMetadata(assetId)?.symbol;
    })
    .filter(Boolean) as string[];

  return {
    hops,
    timestamp,
    amount,
    kind: direction,
    price,
  };
};

/**
 * Returns swap traces array for the given asset pair. Params:
 * 1. `baseAsset` (string, required): base asset symbol
 * 2. `quoteAsset` (string, required): quote asset symbol
 * 3. `limit` (number, required): number of recent executions to return
 */
export async function GET(
  req: NextRequest,
): Promise<NextResponse<Serialized<RecentExecutionsResponse>>> {
  const chainId = process.env['PENUMBRA_CHAIN_ID'];
  if (!chainId) {
    return NextResponse.json({ error: 'PENUMBRA_CHAIN_ID is not set' }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const baseAssetSymbol = searchParams.get('baseAsset');
  const quoteAssetSymbol = searchParams.get('quoteAsset');
  const limit = searchParams.get('limit');
  if (!baseAssetSymbol || !quoteAssetSymbol || !limit) {
    return NextResponse.json(
      { error: 'Missing required baseAsset, quoteAsset, or limit' },
      { status: 400 },
    );
  }

  const registryClient = new ChainRegistryClient();
  const registry = await registryClient.remote.get(chainId);

  const allAssets = registry.getAllAssets();
  const baseAssetMetadata = allAssets.find(
    a => a.symbol.toLowerCase() === baseAssetSymbol.toLowerCase(),
  );
  const quoteAssetMetadata = allAssets.find(
    a => a.symbol.toLowerCase() === quoteAssetSymbol.toLowerCase(),
  );
  if (!baseAssetMetadata?.penumbraAssetId || !quoteAssetMetadata?.penumbraAssetId) {
    return NextResponse.json(
      { error: `Base asset or quoteAsset assetId not found in registry` },
      { status: 400 },
    );
  }

  // We need two queries: * base -> quote (sell)
  //                      * quote -> base (buy)
  const sellStream = await pindexer.recentExecutions(
    baseAssetMetadata.penumbraAssetId,
    quoteAssetMetadata.penumbraAssetId,
    Number(limit),
  );

  const buyStream = await pindexer.recentExecutions(
    quoteAssetMetadata.penumbraAssetId,
    baseAssetMetadata.penumbraAssetId,
    Number(limit),
  );

  const responses = await Promise.all([
    sellStream.map(data => transformData(data, 'sell', registry)),
    buyStream.map(data => transformData(data, 'buy', registry)),
  ]);

  // Weave the two responses together based on timestamps
  const allResponse = responses
    .flat()
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return NextResponse.json(serialize(allResponse));
}
