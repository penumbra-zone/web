import { RateData } from '@penumbra-zone/protobuf/types';
import { createGetter } from './utils/create-getter.js';

export const getValidatorRewardRate = createGetter(
  (rateData?: RateData) => rateData?.validatorRewardRate,
);

export const getValidatorExchangeRate = createGetter(
  (rateData?: RateData) => rateData?.validatorExchangeRate,
);
