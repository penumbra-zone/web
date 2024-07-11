import { Value } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb.js';
import { createGetter } from './utils/create-getter.js';

export const getAssetIdFromValue = createGetter((value?: Value) => value?.assetId);

export const getAmountFromValue = createGetter((value?: Value) => value?.amount);
