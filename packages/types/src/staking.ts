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
  getVotingPowerFromValidatorInfo,
} from './getters';
import { joinLoHiAmount } from './amount';

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

const toTotalVotingPower = (prev: number, curr: ValidatorInfo) =>
  prev + Number(joinLoHiAmount(getVotingPowerFromValidatorInfo(curr)));

const getFormattedVotingPower = (validatorInfo: ValidatorInfo, totalVotingPower: number) =>
  Math.round(
    (Number(joinLoHiAmount(getVotingPowerFromValidatorInfo(validatorInfo))) / totalVotingPower) *
      100,
  );

/**
 * Just a `number`, but used to indicate what information this number
 * represents.
 */
export type VotingPowerAsIntegerPercentage = number;

/**
 * Creates a `Map` of validator infos to their voting power, expressed as a
 * percentage of total voting power.
 */
export const getVotingPowerByValidatorInfo = (
  validatorInfos: ValidatorInfo[],
): Map<ValidatorInfo, VotingPowerAsIntegerPercentage> => {
  const votingPowerByValidatorInfo = new Map<ValidatorInfo, VotingPowerAsIntegerPercentage>();
  const totalVotingPower = validatorInfos.reduce(toTotalVotingPower, 0);

  validatorInfos.reduce((prev, curr) => {
    prev.set(curr, getFormattedVotingPower(curr, totalVotingPower));
    return prev;
  }, votingPowerByValidatorInfo);

  return votingPowerByValidatorInfo;
};
