// @ts-nocheck
/* eslint-disable -- disabling this file as this was created before our strict rules */
// pages/api/blocks/[...params].js

import { IndexerQuerier } from "../../../utils/indexer/connector";

const grpcEndpoint = process.env.PENUMBRA_GRPC_ENDPOINT;
if (!grpcEndpoint) {
  throw new Error("PENUMBRA_GRPC_ENDPOINT is not set");
}

const indexerEndpoint = process.env.PENUMBRA_INDEXER_ENDPOINT;
if (!indexerEndpoint) {
  throw new Error("PENUMBRA_INDEXER_ENDPOINT is not set");
}

export default async function blockInfoFetchHandler(req, res) {
  const indexerQuerier = new IndexerQuerier(indexerEndpoint);
  try {
    if (req.query.params.length === 1) {
      const n = req.query.params[0];
      const data = await indexerQuerier.fetchMostRecentNBlocks(parseInt(n));
      res.status(200).json(data);
    } else {
      const startHeight = req.query.params[0];
      const endHeight = req.query.params[1];
      const data = await indexerQuerier.fetchBlocksWithinRange(
        parseInt(startHeight),
        parseInt(endHeight),
      );
      res.status(200).json(data);
    }
  } catch (error) {
    console.error("Error fetching block data:", error);
    res.status(500).json([]);
  }
  indexerQuerier.close();
}
