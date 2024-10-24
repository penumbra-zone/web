// @ts-nocheck
/* eslint-disable -- disabling this file as this was created before our strict rules */
import { AssetId, Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';

export interface ShieldedPoolQuerierInterface {
  assetMetadata(assetId: AssetId): Promise<Metadata | undefined>;
}
