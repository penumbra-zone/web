import { ChainRegistryClient } from '@penumbra-labs/registry';
import {
  AssetId,
  Metadata,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';

export function getStakingTokenMetaData(chainId: string, assetId: AssetId): Metadata | undefined {
  const registryClient = new ChainRegistryClient();
  const registry = registryClient.get(chainId);

  // undefined if fee is the staking staking token, which saves 32 bytes in the common case
  if (assetId == undefined) {
    assetId = registry.stakingAssetId;
  }
  const StakingTokenMetadata = registry.getMetadata(assetId);

  return StakingTokenMetadata;
}
