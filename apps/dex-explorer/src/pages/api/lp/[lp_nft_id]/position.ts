// pages/api/lp/[lp_nft_id]/position.ts
import { testnetConstants } from "../../../../constants/configConstants";
import { DexQueryServiceClient } from "../../../../utils/protos/services/dex/dex-query-service-client";
import {
  PositionId,
  Position,
} from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb";

export default async function liquidityPositionDataHandler(req: any, res: any) {
  const { lp_nft_id } = req.query;

  const lp_querier = new DexQueryServiceClient({
    grpcEndpoint: testnetConstants.grpcEndpoint,
  });

  try {
    const positionId = new PositionId({
      altBech32m: lp_nft_id,
    });

    const data = await lp_querier.liquidityPositionById(positionId);

    res.status(200).json(data as Position);
  } catch (error) {
    console.error("Error fetching liquidity position grpc data:", error);
    res.status(500).json({"error":`Error fetching liquidity position grpc data: ${error}`});
  }
}
