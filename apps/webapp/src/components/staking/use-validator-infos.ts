import {
  VotingPowerAsIntegerPercentage,
  getValidatorInfo,
  getVotingPowerByValidatorInfo,
  getVotingPowerFromValidatorInfo,
  joinLoHiAmount,
} from '@penumbra-zone/types';
import { ValidatorInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';
import { useCollectedStream } from '../../fetchers/stream';
import { getValidatorInfos } from '../../fetchers/staking';
import { useMemo, useRef } from 'react';
import { ValidatorInfoContext } from './validator-info-context';

const byVotingPower = (validatorInfoA: ValidatorInfo, validatorInfoB: ValidatorInfo) =>
  Number(
    joinLoHiAmount(getVotingPowerFromValidatorInfo(validatorInfoB)) -
      joinLoHiAmount(getVotingPowerFromValidatorInfo(validatorInfoA)),
  );

export const useValidatorInfos = (): ValidatorInfoContext => {
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

    let votingPowerByValidatorInfo = new Map<ValidatorInfo, VotingPowerAsIntegerPercentage>();

    /**
     * Only calculate each validator's voting power once we have everyone's
     * voting power, since each validator's voting power is a percentage of the
     * total.
     */
    if (allValidatorInfosRetrieved) {
      votingPowerByValidatorInfo = getVotingPowerByValidatorInfo(validatorInfos);
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
