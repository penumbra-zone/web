import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { createGetter } from './utils/create-getter';
import { getDisplayDenomExponent, getStartEpochIndex } from './metadata';
import { bech32AssetId } from './asset';
import { Any } from '@bufbuild/protobuf';
import { ValidatorInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';
import { getIdentityKeyFromValidatorInfo } from './validator-info';

export const getMetadata = createGetter((valueView?: ValueView) =>
  valueView?.valueView.case === 'knownAssetId' ? valueView.valueView.value.metadata : undefined,
);

export const getExtendedMetadata = createGetter((valueView?: ValueView) =>
  valueView?.valueView.case === 'knownAssetId'
    ? valueView.valueView.value.extendedMetadata
    : undefined,
);

const getValidatorInfo = createGetter((any?: Any) =>
  any ? ValidatorInfo.fromBinary(any.value) : undefined,
);

/**
 * Only to be used on `ValueView`s that contain delegation tokens -- and thus,
 * validator infos.
 */
export const getValidatorInfoFromValueView = getExtendedMetadata.pipe(getValidatorInfo);

/**
 * Only to be used on `ValueView`s that contain delegation tokens -- and thus,
 * validator infos.
 */
export const getIdentityKeyFromValueView = getValidatorInfoFromValueView.pipe(
  getIdentityKeyFromValidatorInfo,
);

export const getDisplayDenomExponentFromValueView = getMetadata.pipe(getDisplayDenomExponent);

export const getAssetIdFromValueView = createGetter((v?: ValueView) => {
  switch (v?.valueView.case) {
    case 'knownAssetId':
      return v.valueView.value.metadata?.penumbraAssetId;
    case 'unknownAssetId':
      return v.valueView.value.assetId;
    default:
      return undefined;
  }
});

export const getAmount = createGetter(
  (valueView?: ValueView) => valueView?.valueView.value?.amount,
);

/**
 * For a `ValueView` containing an unbonding token, gets the start epoch index.
 */
export const getStartEpochIndexFromValueView = getMetadata.pipe(getStartEpochIndex);

export const getDisplayDenomFromView = createGetter((view?: ValueView) => {
  if (view?.valueView.case === 'unknownAssetId') {
    if (!view.valueView.value.assetId) return undefined;
    return bech32AssetId(view.valueView.value.assetId);
  }

  if (view?.valueView.case === 'knownAssetId') {
    const displayDenom = view.valueView.value.metadata?.display;
    if (displayDenom) return displayDenom;

    const assetId = view.valueView.value.metadata?.penumbraAssetId;
    if (assetId) return bech32AssetId(assetId);

    return 'unknown';
  }

  return 'unknown';
});
