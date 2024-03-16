// pages/api/lp/[lp_nft_id].js
import { IndexerQuerier } from "../../../utils/indexer/connector";
import { testnetConstants } from "../../../constants/configConstants";

export default async function liquidityPostionFetchHandler(req, res) {
  const { lp_nft_id } = req.query;
  const indexerQuerier = new IndexerQuerier(testnetConstants.indexerEndpoint);

  try {
    const data = await indexerQuerier.fetchLiquidityPositionEventsOnBech32(
      lp_nft_id
    );
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching liquidity position events:", error);
    res.status(500).json([]);
  }
  indexerQuerier.close();
}
