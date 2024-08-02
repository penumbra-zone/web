import { RateData } from '@penumbra-zone/protobuf/penumbra/core/component/stake/v1/stake_pb';
import { createGetter } from './utils/create-getter.js';

export const getValidatorRewardRate = createGetter(
  (rateData?: RateData) => rateData?.validatorRewardRate,
);

export const getValidatorExchangeRate = createGetter(
  (rateData?: RateData) => rateData?.validatorExchangeRate,
);
