import { NextRequest, NextResponse } from 'next/server';
import { pindexer } from '@/shared/database';
import { AssetId } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { ChainRegistryClient, Registry } from '@penumbra-labs/registry';
import { getDisplayDenomExponent } from '@penumbra-zone/getters/metadata';
import { pnum } from '@penumbra-zone/types/pnum';
import { hexToUint8Array, base64ToHex } from '@penumbra-zone/types/hex';
import { joinLoHi, LoHi } from '@penumbra-zone/types/lo-hi';
import { serialize, Serialized } from '@/shared/utils/serializer';
import { BatchSwapSummary as PindexerBatchSwapSummary } from '@/shared/database/schema';
import { BatchSwapSummary, BlockSummaryApiResponse } from './types';

function isLoHi(value: unknown): value is LoHi {
  return typeof value === 'object' && value !== null && 'lo' in value;
}

interface AssetWithInner {
  inner: string;
}

function isAsset(value: unknown): value is AssetWithInner {
  return (
    typeof value === 'object' &&
    value !== null &&
    'inner' in value &&
    value.inner !== null &&
    typeof (value as AssetWithInner).inner === 'string'
  );
}

export const getBatchSwapDisplayData =
  (registry: Registry) =>
  (batchSwapSummary: PindexerBatchSwapSummary): BatchSwapSummary => {
    if (!isLoHi(batchSwapSummary.input) || !isLoHi(batchSwapSummary.output)) {
      throw new Error('Invalid input or output: expected LoHi type');
    }

    if (!isAsset(batchSwapSummary.asset_start) || !isAsset(batchSwapSummary.asset_end)) {
      throw new Error('Invalid asset_start or asset_end');
    }

    const startAssetId = new AssetId({
      inner: hexToUint8Array(base64ToHex(batchSwapSummary.asset_start.inner)),
    });
    const startMetadata = registry.getMetadata(startAssetId);
    const startExponent = getDisplayDenomExponent.optional(startMetadata) ?? 0;

    const endAssetId = new AssetId({
      inner: hexToUint8Array(base64ToHex(batchSwapSummary.asset_end.inner)),
    });
    const endMetadata = registry.getMetadata(endAssetId);
    const endExponent = getDisplayDenomExponent.optional(endMetadata) ?? 0;

    const inputBigInt = joinLoHi(batchSwapSummary.input.lo, batchSwapSummary.input.hi);
    const outputBigInt = joinLoHi(batchSwapSummary.output.lo, batchSwapSummary.output.hi);

    return {
      startAsset: startMetadata,
      endAsset: endMetadata,
      startInput: pnum(inputBigInt, startExponent).toString(),
      endOutput: pnum(outputBigInt, endExponent).toString(),
      endPrice: pnum(outputBigInt / inputBigInt, endExponent).toFormattedString(),
      numSwaps: batchSwapSummary.num_swaps,
    };
  };

export async function GET(
  _req: NextRequest,
  { params }: { params: { height: string } },
): Promise<NextResponse<Serialized<BlockSummaryApiResponse>>> {
  const chainId = process.env['PENUMBRA_CHAIN_ID'];
  if (!chainId) {
    return NextResponse.json({ error: 'PENUMBRA_CHAIN_ID is not set' }, { status: 500 });
  }

  const height = params.height;
  if (!height) {
    return NextResponse.json({ error: 'height is required' }, { status: 400 });
  }

  const registryClient = new ChainRegistryClient();
  const registry = await registryClient.remote.get(chainId);

  const blockSummary = await pindexer.getBlockSummary(Number(height));

  if (!blockSummary) {
    return NextResponse.json({ error: 'Block summary not found' }, { status: 404 });
  }

  return NextResponse.json(
    serialize({
      height: blockSummary.height,
      time: blockSummary.time,
      batchSwaps: blockSummary.batch_swaps.map(getBatchSwapDisplayData(registry)),
      numOpenLps: blockSummary.num_open_lps,
      numClosedLps: blockSummary.num_closed_lps,
      numWithdrawnLps: blockSummary.num_withdrawn_lps,
      numSwaps: blockSummary.num_swaps,
      numSwapClaims: blockSummary.num_swap_claims,
      numTxs: blockSummary.num_txs,
    }),
  );
}
