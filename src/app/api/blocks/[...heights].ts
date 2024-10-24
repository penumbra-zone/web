import { NextRequest, NextResponse } from 'next/server';
import { IndexerQuerier } from '@/shared/old-utils/indexer/connector';

const indexerEndpoint = process.env['PENUMBRA_INDEXER_ENDPOINT'] ?? '';
if (!indexerEndpoint) {
  throw new Error('PENUMBRA_INDEXER_ENDPOINT is not set');
}

interface Params {
  heights: [string, string];
}

export async function GET(_req: NextRequest, context: { params: Promise<Params> }) {
  const [startHeight, endHeight] = (await context.params).heights;

  const indexerQuerier = new IndexerQuerier(indexerEndpoint);

  const data = endHeight
    ? await indexerQuerier.fetchBlocksWithinRange(Number(startHeight), Number(endHeight))
    : await indexerQuerier.fetchMostRecentNBlocks(Number(startHeight));

  await indexerQuerier.close();

  return NextResponse.json(data);
}
