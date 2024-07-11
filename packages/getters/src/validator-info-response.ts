import { ValidatorInfoResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb.js';
import { createGetter } from './utils/create-getter.js';
import { getIdentityKeyFromValidatorInfo, getRateData } from './validator-info.js';
import { getValidatorExchangeRate } from './rate-data.js';

export const getValidatorInfo = createGetter(
  (validatorInfoResponse?: ValidatorInfoResponse) => validatorInfoResponse?.validatorInfo,
);

export const getExchangeRateFromValidatorInfoResponse = getValidatorInfo
  .pipe(getRateData)
  .pipe(getValidatorExchangeRate);

export const getIdentityKeyFromValidatorInfoResponse = getValidatorInfo.pipe(
  getIdentityKeyFromValidatorInfo,
);
