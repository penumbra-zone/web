// @ts-nocheck
/* eslint-disable -- disabling this file as this was created before our strict rules */
// pages/api/swaps/[...params].ts

import { DexQueryServiceClient } from "@/utils/protos/services/dex/dex-query-service-client";
import { SwapExecutionWithBlockHeight } from "@/utils/protos/types/DexQueryServiceClientInterface";
import { NextApiRequest, NextApiResponse } from "next";

const grpcEndpoint = process.env.PENUMBRA_GRPC_ENDPOINT!
if (!grpcEndpoint) {
    throw new Error("PENUMBRA_GRPC_ENDPOINT is not set")
}

export default async function swapsByBlockRange(req: NextApiRequest, res: NextApiResponse) {

    const params = req.query.params as string[];

    const startHeight = params[0] || null;
    const endHeight = params[1] || null;

    try {
        if (!startHeight || !endHeight) {
            res.status(400).json({ error: "Invalid query parameters" }); return;
        }
        // TODO: validate StartHeight/EndHeight are numbers
        const dex_querier = new DexQueryServiceClient({
            grpcEndpoint: grpcEndpoint,
        });
        const data = await dex_querier.swapExecutions(
            parseInt(startHeight),
            parseInt(endHeight)
        );

        res.status(200).json(data as SwapExecutionWithBlockHeight[]);
    } catch (error) {
        console.error("Error getting liquidty positions by price grpc data:", error);
        res.status(500).json({
            error: `Error getting liquidty positions by price grpc data: ${error}`,
        });
    }

}