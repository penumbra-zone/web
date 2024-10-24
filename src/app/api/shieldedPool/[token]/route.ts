import { ShieldedPoolQuerier } from '@/shared/old-utils/protos/services/app/shielded-pool';
import { base64ToUint8Array } from '@/shared/old-utils/math/base64';
import { AssetId } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { NextRequest, NextResponse } from 'next/server';

interface Params {
  token: string;
}
export default async function assetMetadataHandler(
  _req: NextRequest,
  context: { params: Promise<Params> },
) {
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
