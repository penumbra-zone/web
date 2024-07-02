import { isAddress } from '@penumbra-zone/bech32m/penumbra';
import { Validation } from '../shared/validation-result';
import { assetPatterns } from '@penumbra-zone/types/assets';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { getDisplay } from '@penumbra-zone/getters/metadata';
import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { getBalances } from '../../fetchers/balances';
import { getMetadata } from '@penumbra-zone/getters/value-view';
import { isKnown } from '../swap/helpers';

export const penumbraAddrValidation = (): Validation => {
  return {
    type: 'error',
    issue: 'invalid address',
    checkFn: (addr: string) => Boolean(addr) && !isAddress(addr),
  };
};

const nonTransferableAssetPatterns = [
  assetPatterns.proposalNft,
  assetPatterns.auctionNft,
  assetPatterns.lpNft,
];

export const isTransferable = (metadata: Metadata) =>
  nonTransferableAssetPatterns.every(pattern => !pattern.matches(getDisplay(metadata)));

export const getTransferableBalancesResponses = async (): Promise<BalancesResponse[]> => {
  const balancesResponses = await getBalances();
  return balancesResponses.filter(
    balance => isKnown(balance) && isTransferable(getMetadata(balance.balanceView)),
  );
};
