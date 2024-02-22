import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { assetPatterns } from '@penumbra-zone/constants';
import { getDisplayDenomFromView } from '@penumbra-zone/types';

export const getBech32IdentityKeyFromValueView = (valueView: ValueView): string => {
  const displayDenom = getDisplayDenomFromView(valueView);

  if (assetPatterns.delegationToken.test(displayDenom))
    return displayDenom.replace(assetPatterns.delegationToken, '$<bech32IdentityKey>');

  if (assetPatterns.unbondingToken.test(displayDenom))
    return displayDenom.replace(assetPatterns.unbondingToken, '$<bech32IdentityKey>');

  throw new Error('Value view did not contain a delegation token or an unbonding token');
};
