import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { assetPatterns } from '@penumbra-zone/constants';
import { getDisplayDenomFromView } from '@penumbra-zone/types';

/**
 * When given a `ValueView` with a delegation token or an unbonding token,
 * returns the bech32 representation of the validator's identity key that the
 * delegation/unbonding token is tied to. Throws if passed a value view that
 * doesn't contain a delegation or unbonding token.
 *
 * This is useful for when you're trying to match a delegation or unbonding
 * token to a given validator by identity key.
 */
export const getBech32IdentityKeyFromValueView = (valueView: ValueView): string => {
  const displayDenom = getDisplayDenomFromView(valueView);

  if (assetPatterns.delegationToken.test(displayDenom))
    return displayDenom.replace(assetPatterns.delegationToken, '$<bech32IdentityKey>');

  if (assetPatterns.unbondingToken.test(displayDenom))
    return displayDenom.replace(assetPatterns.unbondingToken, '$<bech32IdentityKey>');

  throw new Error('Value view did not contain a delegation token or an unbonding token');
};
