// pages/api/simulations/[...params].ts
import { testnetConstants } from "../../../constants/configConstants";
import { SimulationQuerier } from "@/utils/protos/services/dex/simulated-trades";
import { base64ToUint8Array } from "../../../utils/math/base64";
import {
  SimulateTradeRequest,
  SimulateTradeRequest_Routing_SingleHop,
  SimulateTradeResponse,
  SwapExecution,
} from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb";
import { joinLoHi, splitLoHi } from "@/utils/math/hiLo";
import { NextApiRequest, NextApiResponse } from "next";
import { fetchAllTokenAssets } from "@/utils/token/tokenFetch";

export default async function simulationHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const params = req.query.params as string[];

  const token1 = params[0] || null;
  const token2 = params[1] || null;
  const amountIn = params[2] || null;
  const singleHop = params[3] || null;

  let isSingleHop = false;

  try {
    if (!token1 || !token2 || !amountIn) {
      return res.status(400).json({ error: "Invalid query parameters" });
    }

    if (String(singleHop).toLocaleLowerCase() === "singlehop") {
      isSingleHop = true;
    }

    // Get token 1 & 2
    const tokenAssets = fetchAllTokenAssets();
    const asset1Token = tokenAssets.find((x) => x.display === token1);
    const asset2Token = tokenAssets.find((x) => x.display === token2);

    if (!asset1Token || !asset2Token) {
      return res.status(400).json({ error: "Could not find requested token in registry" });
    }
    const sim_querier = new SimulationQuerier({
      grpcEndpoint: testnetConstants.grpcEndpoint,
    });

    const amtIn = splitLoHi(BigInt(Number(amountIn) * 10 ** asset1Token.decimals));

    let simRequest = new SimulateTradeRequest({});
    if (!isSingleHop) {
      simRequest = new SimulateTradeRequest({
        input: {
          assetId: {
            inner: base64ToUint8Array(asset1Token.inner),
          },
          amount: {
            lo: amtIn.lo,
            hi: amtIn.hi,
          },
        },
        output: {
          inner: base64ToUint8Array(asset2Token.inner),
        },
      });
    } else {
      simRequest = new SimulateTradeRequest({
        input: {
          assetId: {
            inner: base64ToUint8Array(asset1Token.inner),
          },
          amount: {
            lo: amtIn.lo,
            hi: amtIn.hi,
          },
        },
        output: {
          inner: base64ToUint8Array(asset2Token.inner),
        },
        routing: {
          setting: {
            case: "singleHop",
            value: SimulateTradeRequest_Routing_SingleHop,
          },
        },
      });
    }

    const data = await sim_querier.simulateTrade(simRequest);
    res.status(200).json(data as SwapExecution);
  } catch (error) {
    console.error("Error simulation trade grpc data:", error);
    res
      .status(500)
      .json({ error: `Error simualtion trade grpc data: ${error}` });
  }
}
