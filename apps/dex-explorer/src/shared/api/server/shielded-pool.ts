import { ShieldedPoolQuerier } from '@/shared/utils/protos/services/app/shielded-pool';
import { AssetId } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { base64ToUint8Array } from '@penumbra-zone/types/base64';
import { NextRequest, NextResponse } from 'next/server';

interface Params {
  token: string;
}
export async function GET(_req: NextRequest, context: { params: Promise<Params> }) {
  const grpcEndpoint = process.env['PENUMBRA_GRPC_ENDPOINT'];
  if (!grpcEndpoint) {
    throw new Error('PENUMBRA_GRPC_ENDPOINT is not set');
  }

  const token_inner = (await context.params).token;
  const decodedTokenInner = decodeURIComponent(token_inner);

  const pool_querier = new ShieldedPoolQuerier({
    grpcEndpoint: grpcEndpoint,
  });

  try {
    const positionId = new AssetId({
      inner: base64ToUint8Array(decodedTokenInner),
    });

    const data = await pool_querier.assetMetadata(positionId);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching asset metadata grpc data:', error);
    return NextResponse.json(
      { error: `Error fetching asset metadata grpc data: ${error as string}` },
      { status: 500 },
    );
  }
}
