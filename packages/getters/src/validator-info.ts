import {
  ValidatorInfo,
  GetValidatorInfoResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb.js';
import { getBondingStateEnum } from './bonding-state.js';
import { getValidatorExchangeRate, getValidatorRewardRate } from './rate-data.js';
import { createGetter } from './utils/create-getter.js';
import { getValidatorStateEnum } from './validator-state.js';
import { getBondingState, getState, getVotingPower } from './validator-status.js';
import { getFundingStreams, getIdentityKey } from './validator.js';

export const getStatus = createGetter((validatorInfo?: ValidatorInfo) => validatorInfo?.status);

export const getRateData = createGetter((validatorInfo?: ValidatorInfo) => validatorInfo?.rateData);

export const getExchangeRateFromValidatorInfo = getRateData.pipe(getValidatorExchangeRate);

export const getValidator = createGetter(
  (validatorInfo?: ValidatorInfo) => validatorInfo?.validator,
);

export const getVotingPowerFromValidatorInfo = getStatus.pipe(getVotingPower);

export const getStateEnumFromValidatorInfo = getStatus.pipe(getState).pipe(getValidatorStateEnum);

export const getBondingStateEnumFromValidatorInfo = getStatus
  .pipe(getBondingState)
  .pipe(getBondingStateEnum);

export const getValidatorRewardRateFromValidatorInfoOptional = getStatus
  .optional()
  .pipe(getRateData)
  .pipe(getValidatorRewardRate);

export const getFundingStreamsFromValidatorInfo = getValidator.pipe(getFundingStreams);

export const getIdentityKeyFromValidatorInfo = getValidator.pipe(getIdentityKey);

export const getValidatorInfoFromGetValidatorInfoResponse = createGetter(
  (validatorInfoResponse?: GetValidatorInfoResponse) => validatorInfoResponse?.validatorInfo,
);
