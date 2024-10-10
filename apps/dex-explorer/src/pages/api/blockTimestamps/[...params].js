// @ts-nocheck
/* eslint-disable -- disabling this file as this was created before our strict rules */
// pages/api/blockTimestamps/[...params].js

import { IndexerQuerier } from '../../../old/utils/indexer/connector';

const indexerEndpoint = process.env.PENUMBRA_INDEXER_ENDPOINT;
if (!indexerEndpoint) {
  throw new Error('PENUMBRA_INDEXER_ENDPOINT is not set');
}

export default async function blockTimestampsFetchHandler(req, res) {
  const indexerQuerier = new IndexerQuerier(indexerEndpoint);

  // if the first param is 'range' then we are fetching a range of blocks

  // Params will be an arbitrarily long list of block heights
  const params = req.query.params;
  let blocks = [];

  if (params[0] === 'range') {
    if (params.length !== 3 || isNaN(params[1]) || isNaN(params[2])) {
      res.status(400).json({ error: 'Invalid block height range' });
      return;
    }

    // define blocks as inclusive range between the two block heights
    const start = parseInt(params[1]);
    const end = parseInt(params[2]);
    blocks = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  } else {
    for (const param of params) {
      if (isNaN(param)) {
        res.status(400).json({ error: 'Invalid block height' });
        return;
      }
      blocks.push(parseInt(param));
    }
  }

  try {
    const data = await indexerQuerier.fetchBlocksByHeight(blocks);
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching block timestamps for heights:', error);
    res.status(500).json([]);
  }
  indexerQuerier.close();
}
