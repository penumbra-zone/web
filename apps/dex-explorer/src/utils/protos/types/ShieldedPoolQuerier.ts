import {
  AssetId,
  Metadata,
} from "@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb";

export interface ShieldedPoolQuerierInterface {
  assetMetadata(assetId: AssetId): Promise<Metadata | undefined>;
}
