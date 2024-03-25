// pages/api/shieldedPool/[token_inner].ts
import { testnetConstants } from "../../../constants/configConstants";
import { ShieldedPoolQuerier } from "../../../utils/protos/services/app/shielded-pool";
import { base64ToUint8Array } from "../../../utils/math/base64";
import {
  AssetId,
  Metadata,
} from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb";

export default async function assetMetadataHandler(req: any, res: any) {
  const { token_inner } = req.query;

  const decodedTokenInner = decodeURIComponent(token_inner);

  const pool_querier = new ShieldedPoolQuerier({
    grpcEndpoint: testnetConstants.grpcEndpoint,
  });

  try {
    const positionId = new AssetId({
      inner: base64ToUint8Array(decodedTokenInner),
    });

    const data = await pool_querier.assetMetadata(positionId);

    res.status(200).json(data as Metadata);
  } catch (error) {
    console.error("Error fetching asset metadata grpc data:", error);
    res.status(500).json({"error": "Error fetching asset metadata grpc data"});
  }
}
