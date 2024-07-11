import {
  BondingState_BondingStateEnum,
  ValidatorInfo,
  ValidatorState_ValidatorStateEnum,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb.js';
import {
  getBondingStateEnumFromValidatorInfo,
  getFundingStreamsFromValidatorInfo,
  getIdentityKeyFromValidatorInfo,
  getStateEnumFromValidatorInfo,
  getVotingPowerFromValidatorInfo,
} from '@penumbra-zone/getters/validator-info';
import { getRateBpsFromFundingStream } from '@penumbra-zone/getters/funding-stream';
import { joinLoHiAmount } from './amount.js';
import { bech32mIdentityKey } from '@penumbra-zone/bech32m/penumbravalid';
import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb.js';
import { getDisplayDenomFromView } from '@penumbra-zone/getters/value-view';
import { assetPatterns } from './assets.js';

export const getStateLabel = (validatorInfo: ValidatorInfo): string =>
  ValidatorState_ValidatorStateEnum[getStateEnumFromValidatorInfo(validatorInfo)];

export const getBondingStateLabel = (validatorInfo: ValidatorInfo): string =>
  BondingState_BondingStateEnum[getBondingStateEnumFromValidatorInfo(validatorInfo)];

const toSum = (prev: number, curr: number) => prev + curr;

/**
 * Given A) a `ValueView` with a delegation token, and B) a `ValidatorInfo`,
 * returns a boolean indicating whether the delegation token is for the given
 * validator. Useful for using with `Array.prototype.find`/`.filter` to identify
 * a value of delegation tokens for a given validator
 */
export const isDelegationTokenForValidator = (
  delegation: ValueView,
  validatorInfo: ValidatorInfo,
): boolean => {
  const delegationMatch = assetPatterns.delegationToken.capture(
    getDisplayDenomFromView(delegation),
  );
  if (!delegationMatch) {
    return false;
  }

  return (
    delegationMatch.idKey === bech32mIdentityKey(getIdentityKeyFromValidatorInfo(validatorInfo))
  );
};

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
 * Returns an object mapping validator infos (by bech32 identity key) to their
 * voting power, expressed as a percentage of total voting power.
 */
export const getVotingPowerByValidatorInfo = (
  validatorInfos: ValidatorInfo[],
): Record<string, VotingPowerAsIntegerPercentage> => {
  const totalVotingPower = validatorInfos.reduce(toTotalVotingPower, 0);

  return validatorInfos.reduce<Record<string, VotingPowerAsIntegerPercentage>>((prev, curr) => {
    prev[bech32mIdentityKey(getIdentityKeyFromValidatorInfo(curr))] = getFormattedVotingPower(
      curr,
      totalVotingPower,
    );
    return prev;
  }, {});
};
