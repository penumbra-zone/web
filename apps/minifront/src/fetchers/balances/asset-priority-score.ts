import { assetPatterns } from '@penumbra-zone/types/assets';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { ChainRegistryClient } from '@penumbra-labs/registry';
import { uint8ArrayToBase64 } from '@penumbra-zone/types/base64';

const chainRegistryClient = new ChainRegistryClient();

const isUmToken = (metadata: Metadata): boolean => {
  const nativeId = chainRegistryClient.globals().stakingAssetId;
  return metadata.penumbraAssetId?.equals(nativeId) ?? false;
};

/**
 * Assigns a priority score to an asset based on its metadata.
 * The higher the score, the earlier the asset will be displayed in the UI.
 * - UM → 50 da
 * - Normal denoms → 40
 * - Auctions → 30
 * - Delegations → 20
 * - Unbondings → 10
 * - Unknown → 0
 *
 * If a user has the balance of the asset, then the balance amount should be multiplied by this score in a sorting function.
 *
 * @param metadata {Metadata} – Asset metadata to assign the priority score
 * @param allAssets {Set<AssetId>} – Set of asset IDs from the registry (for faster search) – the `services` package can't access the registry directly
 */
export const getAssetPriorityScore = (
  metadata: Metadata | undefined,
  allAssets: Set<string>,
): number => {
  if (!metadata) return 0;

  if (isUmToken(metadata)) return 50;

  if (
    assetPatterns.auctionNft.matches(metadata.display) ||
    assetPatterns.lpNft.matches(metadata.display)
  )
    return 30;

  if (assetPatterns.delegationToken.matches(metadata.display)) return 20;

  if (assetPatterns.unbondingToken.matches(metadata.display)) return 10;

  const assetId = uint8ArrayToBase64(metadata.penumbraAssetId?.inner ?? new Uint8Array());
  if (allAssets.has(assetId)) return 40;

  return 0;
};
