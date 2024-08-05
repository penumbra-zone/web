import { GasPrices } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/fee/v1/fee_pb.js';
import { createGetter } from './utils/create-getter.js';

export const getAssetIdFromGasPrices = createGetter((gp?: GasPrices) => gp?.assetId);
