import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { createGetter } from './utils/create-getter';
import { getAssetId, getDisplayDenomExponent } from './metadata';
import { bech32AssetId } from '../asset';

export const getMetadata = createGetter((valueView?: ValueView) =>
  valueView?.valueView.case === 'knownAssetId' ? valueView.valueView.value.metadata : undefined,
);

export const getDisplayDenomExponentFromValueView = getMetadata.pipe(getDisplayDenomExponent);

export const getAssetIdFromValueView = getMetadata.pipe(getAssetId);

export const getAmountFromValueView = createGetter((valueView?: ValueView) =>
  valueView?.valueView.value ? valueView.valueView.value.amount : undefined,
);

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
