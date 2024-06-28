import { ChainRegistryClient } from '@penumbra-labs/registry';
import {
  AssetId,
  Metadata,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';

export function getFeeAssetMetadataOrDefault(
  chainId: string,
  assetId?: AssetId,
): Metadata | undefined {
  const registryClient = new ChainRegistryClient();
  const registry = registryClient.get(chainId);

  const feeAssetId = assetId ?? registryClient.globals().stakingAssetId;
  return registry.getMetadata(feeAssetId);
}
