import { RateData } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb.js';
import { createGetter } from './utils/create-getter.js';

export const getValidatorRewardRate = createGetter(
  (rateData?: RateData) => rateData?.validatorRewardRate,
);

export const getValidatorExchangeRate = createGetter(
  (rateData?: RateData) => rateData?.validatorExchangeRate,
);
