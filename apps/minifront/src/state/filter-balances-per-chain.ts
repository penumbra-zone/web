import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import {
  STAKING_TOKEN_METADATA,
  localAssets,
  assetPatterns,
} from '@penumbra-zone/constants/src/assets';
import { getMetadata } from '@penumbra-zone/getters/src/value-view';
import { getAssetId } from '@penumbra-zone/getters/src/metadata';
import { Chain } from '@penumbra-zone/constants/src/chains';

/**
 * Filters the given IBC loader response balances by checking if any of the assets
 * in the balance view match the staking token's asset ID or are of the same ibc channel.
 *
 * Until unwind support is implemented (https://github.com/penumbra-zone/web/issues/344),
 * we need to ensure ics20 withdraws match these conditions.
 */

export const filterBalancesPerChain = (
  allBalances: BalancesResponse[],
  chain: Chain | undefined,
): BalancesResponse[] => {
  const penumbraAssetId = getAssetId(STAKING_TOKEN_METADATA);
  const assetsWithMatchingChannel = localAssets
    .filter(a => {
      const match = assetPatterns.ibc.capture(a.base);
      if (!match) return false;
      return chain?.ibcChannel === match.channel;
    })
    .map(m => m.penumbraAssetId!);

  const assetIdsToCheck = [penumbraAssetId, ...assetsWithMatchingChannel];

  return allBalances.filter(({ balanceView }) => {
    const metadata = getMetadata(balanceView);
    return assetIdsToCheck.some(assetId => assetId.equals(metadata.penumbraAssetId));
  });
};
