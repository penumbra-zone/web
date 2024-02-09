import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { createGetter } from './utils/create-getter';
import { getAssetId, getDisplayDenomExponent } from './metadata';

export const getMetadata = createGetter((valueView?: ValueView) =>
  valueView?.valueView.case === 'knownAssetId' ? valueView.valueView.value.metadata : undefined,
);

export const getDisplayDenomExponentFromValueView = getMetadata.pipe(getDisplayDenomExponent);

export const getAssetIdFromValueView = getMetadata.pipe(getAssetId);
