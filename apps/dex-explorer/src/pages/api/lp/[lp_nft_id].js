// @ts-nocheck
/* eslint-disable -- disabling this file as this was created before our strict rules */
// pages/api/lp/[lp_nft_id].js
import { IndexerQuerier } from '../../../old/utils/indexer/connector';

const indexerEndpoint = process.env.PENUMBRA_INDEXER_ENDPOINT;
if (!indexerEndpoint) {
  throw new Error('PENUMBRA_INDEXER_ENDPOINT is not set');
}

export default async function liquidityPostionFetchHandler(req, res) {
  const { lp_nft_id } = req.query;
  const indexerQuerier = new IndexerQuerier(indexerEndpoint);

  try {
    const data = await indexerQuerier.fetchLiquidityPositionEventsOnBech32(lp_nft_id);
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching liquidity position events:', error);
    res.status(500).json([]);
  }
  indexerQuerier.close();
}
