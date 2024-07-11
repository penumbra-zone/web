import { ChainRegistryClient } from '@penumbra-labs/registry';
import {
  AssetId,
  Metadata,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb.js';

// TODO: Likely needs to be passed DELETE
export const getFeeAssetMetadataOrDefault = (
  chainId: string,
  assetId?: AssetId,
): Metadata | undefined => {
  const registryClient = new ChainRegistryClient();
  const registry = registryClient.bundled.get(chainId);
  const feeAssetId = assetId ?? registryClient.bundled.globals().stakingAssetId;
  return registry.getMetadata(feeAssetId);
};
