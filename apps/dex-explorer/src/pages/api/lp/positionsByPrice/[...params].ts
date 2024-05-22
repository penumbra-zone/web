// pages/api/lp/positionsByPrice/[...params].ts
import { testnetConstants } from "../../../../constants/configConstants";
import { NextApiRequest, NextApiResponse } from "next";
import { DexQueryServiceClient } from "@/utils/protos/services/dex/dex-query-service-client";
import {
  DirectedTradingPair,
  Position,
} from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb";
import { base64ToUint8Array } from "@/utils/math/base64";
import { fetchAllTokenAssets } from "@/utils/token/tokenFetch";

export default async function positionsByPriceHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const params = req.query.params as string[];

  const token1 = params[0] || null;
  const token2 = params[1] || null;
  const limit = params[2] || null;

  try {
    if (!token1 || !token2 || !limit) {
      return res.status(400).json({ error: "Invalid query parameters" });
    }

    // Get token 1 & 2
    const tokenAssets = fetchAllTokenAssets();
    const asset1Token = tokenAssets.find((x) => x.display === token1);
    const asset2Token = tokenAssets.find((x) => x.display === token2);

    if (!asset1Token || !asset2Token) {
      return res.status(400).json({ error: "Could not find requested token in registry" });
    }

    const lp_querier = new DexQueryServiceClient({
      grpcEndpoint: testnetConstants.grpcEndpoint,
    });

    const tradingPair = new DirectedTradingPair({
      start: {
        inner: base64ToUint8Array(asset1Token.inner),
      },
      end: {
        inner: base64ToUint8Array(asset2Token.inner),
      },
    });

    const data = await lp_querier.liquidityPositionsByPrice(
      tradingPair,
      Number(limit)
    );

    res.status(200).json(data as Position[]);
  } catch (error) {
    console.error("Error getting liquidty positions by price grpc data:", error);
    res
      .status(500)
      .json({
        error: `Error getting liquidty positions by price grpc data: ${error}`,
      });
  }
}
