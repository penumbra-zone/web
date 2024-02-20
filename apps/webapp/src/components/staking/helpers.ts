import {
  BondingState_BondingStateEnum,
  ValidatorInfo,
  ValidatorState_ValidatorStateEnum,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';
import {
  getBondingStateEnumFromValidatorInfo,
  getFundingStreamsFromValidatorInfo,
  getRateBpsFromFundingStream,
  getStateEnumFromValidatorInfo,
} from '@penumbra-zone/types';

export const getStateLabel = (validatorInfo: ValidatorInfo): string =>
  ValidatorState_ValidatorStateEnum[getStateEnumFromValidatorInfo(validatorInfo)];

export const getBondingStateLabel = (validatorInfo: ValidatorInfo): string =>
  BondingState_BondingStateEnum[getBondingStateEnumFromValidatorInfo(validatorInfo)];

const toSum = (prev: number, curr: number) => prev + curr;

/**
 * Given a `ValidatorInfo`, returns the sum of all commission rates as a
 * percentage.
 *
 * To do this, we convert the rate from [basis
 * points](https://en.wikipedia.org/wiki/Basis_point) (which are one hundredth
 * of one percent).
 */
export const calculateCommissionAsPercentage = (validatorInfo: ValidatorInfo): number => {
  const fundingStreams = getFundingStreamsFromValidatorInfo(validatorInfo);
  const totalBps = fundingStreams.map(getRateBpsFromFundingStream).reduce(toSum);

  return totalBps / 100;
};
