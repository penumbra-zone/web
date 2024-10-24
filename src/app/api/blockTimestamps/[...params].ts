import { NextRequest, NextResponse } from 'next/server';
import { IndexerQuerier } from '@/shared/old-utils/indexer/connector.js';

interface Params {
  params?: (string | number)[];
}

export async function GET(_req: NextRequest, context: { params: Promise<Params> }) {
  const indexerEndpoint = process.env['PENUMBRA_INDEXER_ENDPOINT'];

  if (!indexerEndpoint) {
    throw new Error('PENUMBRA_INDEXER_ENDPOINT is not set');
  }

  const indexerQuerier = new IndexerQuerier(indexerEndpoint);

  // Params will be an arbitrarily long list of block heights
  // if the first param is 'range' then we are fetching a range of blocks
  const params = (await context.params).params ?? [];
  let blocks = [];

  if (params[0] === 'range') {
    if (params.length !== 3 || isNaN(params[1] as number) || isNaN(params[2] as number)) {
      return NextResponse.json({ error: 'Invalid block height range' }, { status: 400 });
    }

    // define blocks as inclusive range between the two block heights
    const start = parseInt(params[1] as string);
    const end = parseInt(params[2] as string);
    blocks = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  } else {
    for (const param of params) {
      if (isNaN(param as number)) {
        return NextResponse.json({ error: 'Invalid block height' }, { status: 400 });
      }
      blocks.push(parseInt(param as string));
    }
  }

  try {
    const data = await indexerQuerier.fetchBlocksByHeight(blocks);
    await indexerQuerier.close();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    await indexerQuerier.close();
    console.error('Error fetching block timestamps for heights:', error);
    return NextResponse.json([], { status: 500 });
  }
}
