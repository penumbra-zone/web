import { NextRequest, NextResponse } from 'next/server';
import { DexQueryServiceClient } from '@/shared/old-utils/protos/services/dex/dex-query-service-client';
import { PositionId } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';

interface Params {
  lp_nft_id: string;
}

export async function GET(_req: NextRequest, context: { params: Promise<Params> }) {
  const grpcEndpoint = process.env['PENUMBRA_GRPC_ENDPOINT'];
  if (!grpcEndpoint) {
    throw new Error('PENUMBRA_GRPC_ENDPOINT is not set');
  }

  const { lp_nft_id } = await context.params;

  const lp_querier = new DexQueryServiceClient({
    grpcEndpoint: grpcEndpoint,
  });

  try {
    const positionId = new PositionId({
      altBech32m: lp_nft_id,
    });

    const data = await lp_querier.liquidityPositionById(positionId);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching liquidity position grpc data:', error);
    return NextResponse.json(
      { error: `Error fetching liquidity position grpc data: ${error as string}` },
      { status: 500 },
    );
  }
}
