import { assetPatterns } from '@penumbra-zone/types/assets';
import { getBalances } from '../../fetchers/balances';
import {
  getAmount,
  getDisplayDenomExponentFromValueView,
  getMetadata,
} from '@penumbra-zone/getters/value-view';
import { fromBaseUnitAmount } from '@penumbra-zone/types/amount';
import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { getDisplay } from '@penumbra-zone/getters/metadata';

const byBalanceDescending = (a: BalancesResponse, b: BalancesResponse) => {
  const aExponent = getDisplayDenomExponentFromValueView(a.balanceView);
  const bExponent = getDisplayDenomExponentFromValueView(b.balanceView);
  const aAmount = fromBaseUnitAmount(getAmount(a.balanceView), aExponent);
  const bAmount = fromBaseUnitAmount(getAmount(b.balanceView), bExponent);

  return bAmount.comparedTo(aAmount);
};

const nonSwappableAssetPatterns = [
  assetPatterns.lpNft,
  assetPatterns.proposalNft,
  assetPatterns.votingReceipt,
  assetPatterns.auctionNft,
  assetPatterns.lpNft,

  // In theory, these asset types are swappable, but we have removed them for now to get a better UX
  assetPatterns.delegationToken,
  assetPatterns.unbondingToken,
];

export const isSwappable = (metadata: Metadata) =>
  nonSwappableAssetPatterns.every(pattern => !pattern.matches(getDisplay(metadata)));

export const isKnown = (balancesResponse: BalancesResponse) =>
  balancesResponse.balanceView?.valueView.case === 'knownAssetId';

export const getSwappableBalancesResponses = async (): Promise<BalancesResponse[]> => {
  const balancesResponses = await getBalances();

  return balancesResponses
    .filter(isKnown)
    .filter(balance => isSwappable(getMetadata(balance.balanceView)))
    .sort(byBalanceDescending);
};
