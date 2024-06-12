import { ValidatorInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';
import { createGetter } from './utils/create-getter';
import { getBondingState, getState, getVotingPower } from './validator-status';
import { getValidatorStateEnum } from './validator-state';
import { getValidatorExchangeRate, getValidatorRewardRate } from './rate-data';
import { getBondingStateEnum } from './bonding-state';
import { getFundingStreams, getIdentityKey } from './validator';

export const getStatus = createGetter((validatorInfo?: ValidatorInfo) => validatorInfo?.status);

export const getRateData = createGetter((validatorInfo?: ValidatorInfo) => validatorInfo?.rateData);

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
export const getExchangeRateFromValidatorInfo = getRateData.pipe(getValidatorExchangeRate);
