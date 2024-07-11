import { assetPatterns } from '@penumbra-zone/types/assets';
import {
  AssetId,
  Metadata,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb.js';

/**
 * Assigns a priority score to an asset based on its metadata.
 * The higher the score, the earlier the asset will be displayed in the UI.
 * - UM → 50 da
 * - Normal and IBC denoms → 40
 * - Auctions → 30
 * - Delegations → 20
 * - Unbondings, proposals, voting receipts → 10
 * - Unknown → 0
 *
 * If a user has the balance of the asset, then the balance amount should be multiplied by this score in a sorting function.
 *
 * @param metadata {Metadata} – Asset metadata to assign the priority score
 * @param nativeTokenId {AssetId} – AssetId of the native chain token (UM)
 */
export const getAssetPriorityScore = (
  metadata: Metadata | undefined,
  nativeTokenId: AssetId,
): bigint => {
  if (!metadata) {
    return 0n;
  }

  if (metadata.penumbraAssetId?.equals(nativeTokenId)) {
    return 50n;
  }

  if (assetPatterns.ibc.matches(metadata.display)) {
    return 40n;
  }

  if (
    assetPatterns.auctionNft.matches(metadata.display) ||
    assetPatterns.lpNft.matches(metadata.display)
  ) {
    return 30n;
  }

  if (assetPatterns.delegationToken.matches(metadata.display)) {
    return 20n;
  }

  if (
    assetPatterns.unbondingToken.matches(metadata.display) ||
    assetPatterns.proposalNft.matches(metadata.display) ||
    assetPatterns.votingReceipt.matches(metadata.display)
  ) {
    return 10n;
  }

  return 40n;
};
