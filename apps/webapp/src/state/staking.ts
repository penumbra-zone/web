import { ValidatorInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';
import { AllSlices, SliceCreator } from '.';
import { getDelegationsForAccount } from '../fetchers/staking';
import {
  VotingPowerAsIntegerPercentage,
  getDisplayDenomFromView,
  getValidatorInfoFromValueView,
  getVotingPowerByValidatorInfo,
} from '@penumbra-zone/types';
import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { getBalancesByAccount } from '../fetchers/balances/by-account';
import { STAKING_TOKEN } from '@penumbra-zone/constants';
import { AddressIndex } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';

export interface StakingSlice {
  /** The account for which we're viewing delegations. */
  account: number;
  /** A map of numeric account indexes to delegations for that account. */
  delegationsByAccount: Map<number, ValueView[]>;
  /**
   * A map of numeric account indexes to unstaked (UM) tokens for that account.
   */
  unstakedTokensByAccount: Map<number, ValueView | undefined>;
  /**
   * Load all delegations for the currently selected account, and save them into
   * `delegationsByAccount`.
   */
  loadDelegationsForCurrentAccount: () => Promise<void>;
  /**
   * Load unstaked (UM) tokens across _all_ accounts, and save them to
   * `unstakedTokensByAccount`.
   */
  loadUnstakedTokensByAccount: () => Promise<void>;
  loading: boolean;
  error: unknown;
  votingPowerByValidatorInfo: Record<string, VotingPowerAsIntegerPercentage>;
}

export const createStakingSlice = (): SliceCreator<StakingSlice> => (set, get) => ({
  account: 0,
  delegationsByAccount: new Map(),
  unstakedTokensByAccount: new Map(),
  loadDelegationsForCurrentAccount: async () => {
    const addressIndex = new AddressIndex({ account: get().staking.account });
    const validatorInfos: ValidatorInfo[] = [];

    set(state => {
      state.staking.delegationsByAccount.set(addressIndex.account, []);
      state.staking.votingPowerByValidatorInfo = {};
    });

    for await (const delegation of getDelegationsForAccount(addressIndex)) {
      const delegations = get().staking.delegationsByAccount.get(addressIndex.account) ?? [];

      set(state => {
        state.staking.delegationsByAccount.set(addressIndex.account, [...delegations, delegation]);
      });

      validatorInfos.push(getValidatorInfoFromValueView(delegation));
    }

    /**
     * We can only calculate _each_ validator's percentage voting power once
     * we've loaded _all_ voting powers.
     */
    set(state => {
      state.staking.votingPowerByValidatorInfo = getVotingPowerByValidatorInfo(validatorInfos);
    });
  },
  loadUnstakedTokensByAccount: async () => {
    const balancesByAccount = await getBalancesByAccount();
    const unstakedTokensByAccount = balancesByAccount.reduce<Map<number, ValueView | undefined>>(
      (prev, curr) => {
        const unstakedTokens = curr.balances.find(
          ({ value }) => getDisplayDenomFromView(value) === STAKING_TOKEN,
        );
        prev.set(curr.index.account, unstakedTokens?.value);
        return prev;
      },
      new Map(),
    );

    set(state => {
      state.staking.unstakedTokensByAccount = unstakedTokensByAccount;
    });
  },
  error: undefined,
  loading: false,
  votingPowerByValidatorInfo: {},
});

export const stakingSelector = (state: AllSlices) => state.staking;
