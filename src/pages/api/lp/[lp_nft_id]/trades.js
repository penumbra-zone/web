// pages/api/lp/[lp_nft_id]/trades.js
import { IndexerQuerier } from "../../../../utils/indexer/connector";
import { testnetConstants } from "../../../../constants/configConstants";

export default async function liquidityPositionTradeHandler(req, res) {
  const { lp_nft_id } = req.query;
  const indexerQuerier = new IndexerQuerier(testnetConstants.indexerEndpoint);

  try {
    const data = await indexerQuerier.fetchLiquidityPositionExecutionEventsOnBech32(
      lp_nft_id
    );
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching liquidity position execution events:", error);
    res.status(500).json([]);
  }
  indexerQuerier.close();
}
