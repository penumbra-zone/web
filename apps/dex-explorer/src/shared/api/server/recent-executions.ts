import { NextRequest, NextResponse } from 'next/server';
import { pindexer } from '@/shared/database';
import { ChainRegistryClient } from '@penumbra-labs/registry';
import { serialize, Serialized } from '@/shared/utils/serializer';
import { AssetId, Value } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { pnum } from '@penumbra-zone/types/pnum';

const transformDbVal = ({
  context_asset_end,
  context_asset_start,
  delta_1,
  delta_2,
  lambda_1,
  lambda_2,
  time,
}: {
  context_asset_end: Buffer;
  context_asset_start: Buffer;
  delta_1: string;
  delta_2: string;
  lambda_1: string;
  lambda_2: string;
  time: Date;
}): RecentExecution => {
  const baseAssetId = new AssetId({
    inner: Uint8Array.from(context_asset_start),
  });
  const quoteAssetId = new AssetId({ inner: Uint8Array.from(context_asset_end) });

  // Determine trade direction
  const isBaseAssetInput = BigInt(delta_1) !== 0n;
  const kind = isBaseAssetInput ? 'sell' : 'buy';

  // Amount of base & quote asset being traded in or out of
  const baseAmount = isBaseAssetInput ? pnum(delta_1) : pnum(lambda_1);
  const quoteAmount = isBaseAssetInput ? pnum(lambda_2) : pnum(delta_2);

  const price = baseAmount.toBigNumber().div(quoteAmount.toBigNumber()).toNumber();
  const timestamp = time.toISOString();

  return {
    kind,
    amount: new Value({ amount: baseAmount.toAmount(), assetId: baseAssetId }),
    price: { amount: price, assetId: quoteAssetId },
    timestamp,
  };
};

export type RecentExecutionsResponse = RecentExecution[] | { error: string };

interface FloatValue {
  assetId: AssetId;
  amount: number;
}

export interface RecentExecution {
  kind: 'buy' | 'sell';
  amount: Value;
  price: FloatValue;
  timestamp: string;
}

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

  // TODO: Add getMetadataBySymbol() helper to registry npm package
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

  const results = await pindexer.recentExecutions(
    baseAssetMetadata.penumbraAssetId,
    quoteAssetMetadata.penumbraAssetId,
    Number(limit),
  );

  const response = results.map(transformDbVal);

  return NextResponse.json(serialize(response));
}
