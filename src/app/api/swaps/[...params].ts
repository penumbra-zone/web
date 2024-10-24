import { DexQueryServiceClient } from '@/shared/old-utils/protos/services/dex/dex-query-service-client';
import { NextRequest, NextResponse } from 'next/server';

interface Params {
  params: string[];
}

export async function GET(_req: NextRequest, context: { params: Promise<Params> }) {
  const grpcEndpoint = process.env['PENUMBRA_GRPC_ENDPOINT'];
  if (!grpcEndpoint) {
    throw new Error('PENUMBRA_GRPC_ENDPOINT is not set');
  }

  const { params } = await context.params;
  const startHeight = params[0] ?? null;
  const endHeight = params[1] ?? null;

  try {
    if (!startHeight || !endHeight) {
      return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
    }
    // TODO: validate StartHeight/EndHeight are numbers
    const dex_querier = new DexQueryServiceClient({
      grpcEndpoint: grpcEndpoint,
    });
    const data = await dex_querier.swapExecutions(parseInt(startHeight), parseInt(endHeight));

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error getting liquidty positions by price grpc data:', error);
    return NextResponse.json(
      {
        error: `Error getting liquidty positions by price grpc data: ${error as string}`,
      },
      { status: 500 },
    );
  }
}
