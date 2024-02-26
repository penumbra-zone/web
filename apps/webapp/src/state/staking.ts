import { ValidatorInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';
import { AllSlices, SliceCreator } from '.';
import { getValidatorInfos } from '../fetchers/staking';
import {
  VotingPowerAsIntegerPercentage,
  getValidatorInfo,
  getVotingPowerByValidatorInfo,
  getVotingPowerFromValidatorInfo,
  joinLoHiAmount,
} from '@penumbra-zone/types';

export interface StakingSlice {
  loadValidators: () => Promise<void>;
  validatorInfos: ValidatorInfo[];
  loading: boolean;
  error: unknown;
  votingPowerByValidatorInfo: Map<ValidatorInfo, VotingPowerAsIntegerPercentage>;
}

const byVotingPower = (validatorInfoA: ValidatorInfo, validatorInfoB: ValidatorInfo) =>
  Number(
    joinLoHiAmount(getVotingPowerFromValidatorInfo(validatorInfoB)) -
      joinLoHiAmount(getVotingPowerFromValidatorInfo(validatorInfoA)),
  );

export const createStakingSlice = (): SliceCreator<StakingSlice> => (set, get) => ({
  loadValidators: async () => {
    try {
      set(state => {
        state.staking.loading = true;
      });

      const query = getValidatorInfos();

      for await (const validatorInfoResponse of query) {
        const validatorInfo = getValidatorInfo(validatorInfoResponse);

        const sortedValidatorInfos = [...get().staking.validatorInfos, validatorInfo].sort(
          byVotingPower,
        );

        set(state => {
          state.staking.validatorInfos = sortedValidatorInfos;
        });
      }

      /**
       * Only calculate _each_ validator's voting power once we have _all_
       * validators' voting powers, since each validator's voting power is a
       * percentage of the total.
       */
      const votingPowerByValidatorInfo = getVotingPowerByValidatorInfo(
        get().staking.validatorInfos,
      );

      set(state => {
        state.staking.votingPowerByValidatorInfo = votingPowerByValidatorInfo;
      });
    } catch (e) {
      set(state => {
        state.staking.error = e;
      });
    } finally {
      set(state => {
        state.staking.loading = false;
      });
    }
  },
  validatorInfos: [],
  error: undefined,
  loading: false,
  votingPowerByValidatorInfo: new Map(),
});

export const stakingSelector = (state: AllSlices) => state.staking;
