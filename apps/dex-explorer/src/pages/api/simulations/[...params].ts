// @ts-nocheck
/* eslint-disable -- disabling this file as this was created before our strict rules */
// pages/api/simulations/[...params].ts
import { SimulationQuerier } from "@/old/utils/protos/services/dex/simulated-trades";
import { base64ToUint8Array } from "@/old/utils/math/base64";
import {
  SimulateTradeRequest,
  SimulateTradeRequest_Routing_SingleHop,
  SimulateTradeResponse,
  SwapExecution,
} from "@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb";
import { joinLoHi, splitLoHi } from "@/old/utils/math/hiLo";
import { NextApiRequest, NextApiResponse } from "next";
import { fetchAllTokenAssets } from "@/old/utils/token/tokenFetch";

const grpcEndpoint = process.env.PENUMBRA_GRPC_ENDPOINT!;
if (!grpcEndpoint) {
  throw new Error("PENUMBRA_GRPC_ENDPOINT is not set");
}

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
      res.status(400).json({ error: "Invalid query parameters" }); return;
    }

    if (String(singleHop).toLocaleLowerCase() === "singlehop") {
      isSingleHop = true;
    }

    // Get token 1 & 2
    const tokenAssets = fetchAllTokenAssets(process.env.PENUMBRA_CHAIN_ID);
    const asset1Token = tokenAssets.find(
      (x) => x.display.toLocaleLowerCase() === token1.toLocaleLowerCase()
    );
    const asset2Token = tokenAssets.find(
      (x) => x.display.toLocaleLowerCase() === token2.toLocaleLowerCase()
    );

    if (!asset1Token || !asset2Token) {
      res
        .status(400)
        .json({ error: "Could not find requested token in registry" }); return;
    }
    const sim_querier = new SimulationQuerier({
      grpcEndpoint: grpcEndpoint,
    });

    const amtIn = splitLoHi(
      BigInt(Number(amountIn) * 10 ** asset1Token.decimals)
    );

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
    const errorString = error as string;

    // If the error contains 'there are no orders to fulfill this swap', there are no orders to fulfill the trade, so just return an empty array
    if (error instanceof Error) {
      const errorMessage = error.message;

      // If the error message contains 'there are no orders to fulfill this swap', return an empty array
      if (errorMessage.includes("there are no orders to fulfill this swap")) {
        console.log("No orders to fulfill swap");
        res.status(200).json({ traces: [] }); return;
      }
    }

    res
      .status(500)
      .json({ error: `Error simualtion trade grpc data: ${error}` });
  }
}
