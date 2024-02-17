import {
  getValidatorInfo,
  getVotingPowerFromValidatorInfo,
  joinLoHiAmount,
} from '@penumbra-zone/types';
import { ValidatorInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';
import { useCollectedStream } from '../../fetchers/stream';
import { getValidatorInfos } from '../../fetchers/staking';
import { useMemo, useRef } from 'react';

const byVotingPower = (validatorInfoA: ValidatorInfo, validatorInfoB: ValidatorInfo) =>
  Number(
    joinLoHiAmount(getVotingPowerFromValidatorInfo(validatorInfoB)) -
      joinLoHiAmount(getVotingPowerFromValidatorInfo(validatorInfoA)),
  );

const toTotalVotingPower = (prev: number, curr: ValidatorInfo) =>
  prev + Number(joinLoHiAmount(getVotingPowerFromValidatorInfo(curr)));

const getFormattedVotingPower = (validatorInfo: ValidatorInfo, totalVotingPower: number) =>
  Math.round(
    (Number(joinLoHiAmount(getVotingPowerFromValidatorInfo(validatorInfo))) / totalVotingPower) *
      100,
  );

export const useValidatorInfos = (): {
  validatorInfos: ValidatorInfo[];

  /** Each validator's voting power, expressed as an integer between 0-100. */
  votingPowerByValidatorInfo: Map<ValidatorInfo, number>;

  loading: boolean;
  error: unknown;
} => {
  /**
   * Use a ref so that it doesn't constantly re-fetch when the component
   * re-renders.
   *
   * @todo: How to trigger a refresh?
   */
  const query = useRef(getValidatorInfos());

  const {
    data: validatorInfoResponses,
    end: allValidatorInfosRetrieved,
    error,
  } = useCollectedStream(query.current);

  const { validatorInfos, votingPowerByValidatorInfo } = useMemo(() => {
    const validatorInfos = validatorInfoResponses.map(getValidatorInfo).sort(byVotingPower);

    const votingPowerByValidatorInfo = new Map();

    /**
     * Only calculate each validator's voting power once we have everyone's
     * voting power, since each validator's voting power is a percentage of the
     * total.
     */
    if (allValidatorInfosRetrieved) {
      const totalVotingPower = validatorInfos.reduce(toTotalVotingPower, 0);

      validatorInfos.reduce((prev, curr) => {
        prev.set(curr, getFormattedVotingPower(curr, totalVotingPower));
        return prev;
      }, votingPowerByValidatorInfo);
    }

    return { validatorInfos, votingPowerByValidatorInfo };
  }, [validatorInfoResponses, allValidatorInfosRetrieved]);

  return {
    validatorInfos,
    votingPowerByValidatorInfo,
    loading: !allValidatorInfosRetrieved,
    error,
  };
};
