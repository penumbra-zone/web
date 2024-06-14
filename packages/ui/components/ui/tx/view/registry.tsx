import { ChainRegistryClient } from '@penumbra-labs/registry';
import {
  AssetId,
  Metadata,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';

export function getStakingTokenMetaData(
  chainId: string,
  assetId: AssetId | undefined,
): Metadata | undefined {
  const registryClient = new ChainRegistryClient();
  const registry = registryClient.get(chainId);

  if (assetId === undefined) {
    assetId = registry.stakingAssetId;
  }
  const StakingTokenMetadata = registry.getMetadata(assetId);

  return StakingTokenMetadata;
}
