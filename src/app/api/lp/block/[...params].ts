import { IndexerQuerier } from '@/shared/old-utils/indexer/connector.js';
import { NextRequest, NextResponse } from 'next/server';

interface Params {
  params: string[];
}

export async function GET(_req: NextRequest, context: { params: Promise<Params> }) {
  const indexerEndpoint = process.env['PENUMBRA_INDEXER_ENDPOINT'];
  if (!indexerEndpoint) {
    throw new Error('PENUMBRA_INDEXER_ENDPOINT is not set');
  }

  const { params } = await context.params;

  const indexerQuerier = new IndexerQuerier(indexerEndpoint);
  try {
    if (params.length === 1) {
      // Get all ExecutionEvents in the block for block detail page
      const blockHeight = params[0] ?? '';
      const data = await indexerQuerier.fetchLiquidityPositionExecutionEventsOnBlockHeight(
        parseInt(blockHeight),
      );
      await indexerQuerier.close();
      return NextResponse.json(data);
    } else {
      // Get all PositionOpen/Close Events in the block range for block timeline and block detail pages
      const startHeight = params[0] ?? '';
      const endHeight = params[1] ?? '';
      const data = await indexerQuerier.fetchLiquidityPositionOpenCloseEventsOnBlockHeightRange(
        parseInt(startHeight),
        parseInt(endHeight),
      );
      await indexerQuerier.close();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Error fetching liquidity position events:', error);
    await indexerQuerier.close();
    return NextResponse.json([], { status: 500 });
  }
}
