// pages/api/ohlc/[...params].ts

import { testnetConstants } from "@/constants/configConstants";
import { DexQueryServiceClient } from "@/utils/protos/services/dex/dex-query-service-client";
import { NextApiRequest, NextApiResponse } from "next";
import {
  CandlestickData,
  DirectedTradingPair,
} from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb";
import { AssetId } from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb";
import { base64ToUint8Array } from "@/utils/math/base64";
import { fetchAllTokenAssets } from "@/utils/token/tokenFetch";

export default async function candleStickData(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const params = req.query.params as string[];

  const tokenIn = params[0] || null;
  const tokenOut = params[1] || null;
  const startHeight = params[2] || null;
  const limit = params[3] || null;

  try {
    const tokenAssets = fetchAllTokenAssets();
    if (!startHeight || !tokenIn || !tokenOut || !limit) {
      return res.status(400).json({ error: "Invalid query parameters" });
    }

    const dex_querier = new DexQueryServiceClient({
      grpcEndpoint: testnetConstants.grpcEndpoint,
    });

    const tokenInInner = tokenAssets.find(
      (x) => x.display.toLowerCase() === tokenIn.toLowerCase()
    )?.inner;
    const tokenOutInner = tokenAssets.find(
      (x) => x.display.toLowerCase() === tokenOut.toLowerCase()
    )?.inner;
    if (!tokenInInner || !tokenOutInner) {
      return res.status(400).json({
        error: `Invalid token pair, a token was not found: ${tokenIn} ${tokenOut}`,
      });
    }

    const tradingPair = new DirectedTradingPair();
    tradingPair.start = new AssetId();
    tradingPair.start.inner = base64ToUint8Array(tokenInInner);
    tradingPair.end = new AssetId();
    tradingPair.end.inner = base64ToUint8Array(tokenOutInner);

    const data = await dex_querier.candlestickData(
      tradingPair,
      parseInt(startHeight),
      parseInt(limit)
    );

    res.status(200).json(data as CandlestickData[]);
  } catch (error) {
    console.error("Error getting candlestick by grpc data:", error);
    res.status(500).json({
      error: `Error getting candlestick by grpc data: ${error}`,
    });
  }
}
