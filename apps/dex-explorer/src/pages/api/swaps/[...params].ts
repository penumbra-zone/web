// pages/api/swaps/[...params].ts

import { testnetConstants } from "@/constants/configConstants";
import { DexQueryServiceClient } from "@/utils/protos/services/dex/dex-query-service-client";
import { SwapExecutionWithBlockHeight } from "@/utils/protos/types/DexQueryServiceClientInterface";
import { NextApiRequest, NextApiResponse } from "next";

export default async function swapsByBlockRange(req: NextApiRequest, res: NextApiResponse) {

    const params = req.query.params as string[];

    const startHeight = params[0] || null;
    const endHeight = params[1] || null;

    try {
        if (!startHeight || !endHeight) {
            return res.status(400).json({ error: "Invalid query parameters" });
        }
        // TODO: validate StartHeight/EndHeight are numbers
        const dex_querier = new DexQueryServiceClient({
            grpcEndpoint: testnetConstants.grpcEndpoint,
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