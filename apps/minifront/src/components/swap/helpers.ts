import { assetPatterns } from '@penumbra-zone/constants/assets';
import { getBalances } from '../../fetchers/balances';
import {
  getAmount,
  getDisplayDenomExponentFromValueView,
  getDisplayDenomFromView,
} from '@penumbra-zone/getters/value-view';
import { fromBaseUnitAmount } from '@penumbra-zone/types/amount';
import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';

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
];

const isSwappable = (balancesResponse: BalancesResponse) =>
  nonSwappableAssetPatterns.every(
    pattern => !pattern.matches(getDisplayDenomFromView(balancesResponse.balanceView)),
  );

const isKnown = (balancesResponse: BalancesResponse) =>
  balancesResponse.balanceView?.valueView.case === 'knownAssetId';

export const getSwappableBalancesResponses = async (): Promise<BalancesResponse[]> => {
  const balancesResponses = await getBalances();
  return balancesResponses.filter(isSwappable).filter(isKnown).sort(byBalanceDescending);
};
