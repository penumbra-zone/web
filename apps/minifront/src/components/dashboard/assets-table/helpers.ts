import { assetPatterns } from '@penumbra-zone/types/assets';
import { getDisplay } from '@penumbra-zone/getters/metadata';
import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { getMetadata } from '@penumbra-zone/getters/value-view';

const hiddenAssetPatterns = [assetPatterns.auctionNft];

const isUnknown = (balancesResponse: BalancesResponse) =>
  balancesResponse.balanceView?.valueView.case === 'unknownAssetId';

export const isVisible = (balance: BalancesResponse) =>
  isUnknown(balance) ||
  hiddenAssetPatterns.every(
    pattern => !pattern.matches(getDisplay(getMetadata(balance.balanceView))),
  );
