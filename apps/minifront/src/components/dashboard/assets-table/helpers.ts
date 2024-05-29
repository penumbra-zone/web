import { assetPatterns } from '@penumbra-zone/types/assets';
import { getDisplay } from '@penumbra-zone/getters/metadata';
import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { getMetadata } from '@penumbra-zone/getters/value-view';

// We don't have to disclose auctionNft to the user since it is a kind of utility asset needed only
// for the implementation of the Dutch auction
const hiddenAssetPatterns = [assetPatterns.auctionNft, assetPatterns.lpNft];

export const isUnknown = (balancesResponse: BalancesResponse) =>
  balancesResponse.balanceView?.valueView.case === 'unknownAssetId';

export const shouldDisplay = (balance: BalancesResponse) =>
  isUnknown(balance) ||
  hiddenAssetPatterns.every(
    pattern => !pattern.matches(getDisplay(getMetadata(balance.balanceView))),
  );
