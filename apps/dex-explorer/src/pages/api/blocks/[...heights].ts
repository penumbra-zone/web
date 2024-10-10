import { NextApiRequest, NextApiResponse } from 'next';
import { IndexerQuerier } from '@/old/utils/indexer/connector';

const indexerEndpoint = process.env['PENUMBRA_INDEXER_ENDPOINT'] ?? '';
if (!indexerEndpoint) {
  throw new Error('PENUMBRA_INDEXER_ENDPOINT is not set');
}

interface QueryParams {
  heights?: string[];
}

export default async function blockInfoFetchHandler(req: NextApiRequest, res: NextApiResponse) {
  const [startHeight, endHeight] = (req.query as QueryParams).heights ?? [];

  const indexerQuerier = new IndexerQuerier(indexerEndpoint);

  const data = endHeight
    ? await indexerQuerier.fetchBlocksWithinRange(Number(startHeight), Number(endHeight))
    : await indexerQuerier.fetchMostRecentNBlocks(Number(startHeight));

  await indexerQuerier.close();

  res.status(200).json(data);
  return;
}
