import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import { bech32AssetId } from './asset';

export const getDisplayDenomFromView = (view: ValueView) => {
  if (view.valueView.case === 'unknownAssetId') {
    if (!view.valueView.value.assetId) throw new Error('no asset id for unknown denom');
    return bech32AssetId(view.valueView.value.assetId);
  }

  if (view.valueView.case === 'knownAssetId') {
    const displayDenom = view.valueView.value.metadata?.display;
    if (displayDenom) return displayDenom;

    const assetId = view.valueView.value.metadata?.penumbraAssetId;
    if (assetId) return bech32AssetId(assetId);

    return 'unknown';
  }

  return 'unknown';
};
