// @ts-nocheck
/* eslint-disable -- disabling this file as this was created before our strict rules */
// pages/api/lp/[lp_nft_id]/position.ts
import { DexQueryServiceClient } from "../../../../utils/protos/services/dex/dex-query-service-client";
import {
  PositionId,
  Position,
} from "@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb";

const grpcEndpoint = process.env.PENUMBRA_GRPC_ENDPOINT!;
if (!grpcEndpoint) {
  throw new Error("PENUMBRA_GRPC_ENDPOINT is not set");
}

export default async function liquidityPositionDataHandler(req: any, res: any) {
  const { lp_nft_id } = req.query;

  const lp_querier = new DexQueryServiceClient({
    grpcEndpoint: grpcEndpoint,
  });

  try {
    const positionId = new PositionId({
      altBech32m: lp_nft_id,
    });

    const data = await lp_querier.liquidityPositionById(positionId);

    res.status(200).json(data!);
  } catch (error) {
    console.error("Error fetching liquidity position grpc data:", error);
    res
      .status(500)
      .json({ error: `Error fetching liquidity position grpc data: ${error}` });
  }
}
