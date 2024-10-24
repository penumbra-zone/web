import { IndexerQuerier } from '@/shared/old-utils/indexer/connector.tsx';
import { NextRequest, NextResponse } from 'next/server';

interface Params {
  lp_nft_id: string;
}

export async function GET(_req: NextRequest, context: { params: Promise<Params> }) {
  const indexerEndpoint = process.env['PENUMBRA_INDEXER_ENDPOINT'];
  if (!indexerEndpoint) {
    throw new Error('PENUMBRA_INDEXER_ENDPOINT is not set');
  }

  const { lp_nft_id } = await context.params;
  const indexerQuerier = new IndexerQuerier(indexerEndpoint);

  try {
    const data = await indexerQuerier.fetchLiquidityPositionExecutionEventsOnBech32(lp_nft_id);
    await indexerQuerier.close();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching liquidity position execution events:', error);
    await indexerQuerier.close();
    return NextResponse.json([], { status: 500 });
  }
}
