import {
  AssetId,
  Metadata,
} from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb";

export interface ShieldedPoolQuerierInterface {
  assetMetadata(assetId: AssetId): Promise<Metadata | undefined>;
}
