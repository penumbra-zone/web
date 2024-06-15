import { ValidatorInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';
import { SliceCreator, useStore } from '..';
import { getDisplayDenomExponent } from '@penumbra-zone/getters/metadata';
import {
  Metadata,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { BalancesByAccount, getBalancesByAccount } from '../../fetchers/balances/by-account';
import { AddressIndex } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { planBuildBroadcast } from '../helpers';
import {
  TransactionPlannerRequest,
  UnbondingTokensByAddressIndexResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { BigNumber } from 'bignumber.js';
import { assembleUndelegateClaimRequest } from './assemble-undelegate-claim-request';
import throttle from 'lodash/throttle';
import {
  getAmount,
  getAssetIdFromValueView,
  getDisplayDenomExponentFromValueView,
  getDisplayDenomFromView,
  getValidatorInfoFromValueView,
} from '@penumbra-zone/getters/value-view';
import {
  getRateData,
  getVotingPowerFromValidatorInfo,
} from '@penumbra-zone/getters/validator-info';
import {
  getVotingPowerByValidatorInfo,
  isDelegationTokenForValidator,
  VotingPowerAsIntegerPercentage,
} from '@penumbra-zone/types/staking';
import { joinLoHiAmount } from '@penumbra-zone/types/amount';
import { splitLoHi, toBaseUnit } from '@penumbra-zone/types/lo-hi';
import { viewClient } from '../../clients';
import { getValueView as getValueViewFromDelegationsByAddressIndexResponse } from '@penumbra-zone/getters/delegations-by-address-index-response';
import { getValueView as getValueViewFromUnbondingTokensByAddressIndexResponse } from '@penumbra-zone/getters/unbonding-tokens-by-address-index-response';
import { getStakingTokenMetadata } from '../../fetchers/registry';
import { zeroValueView } from '../../utils/zero-value-view';
import { assetPatterns } from '@penumbra-zone/types/assets';
import { ZQueryState, createZQuery } from '@penumbra-zone/zquery';

interface UnbondingTokensForAccount {
  claimable: {
    /**
     * The total value of all claimable unbonding tokens in this account, in the
     * staking token. This is what they will be worth once claimed, assuming no
     * slashing.
     */
    total: ValueView;
    tokens: ValueView[];
  };
  notYetClaimable: {
    /**
     * The total value of all not-yet-claimable unbonding tokens in this
     * account, in the staking token. This is what they will be worth once
     * claimed, assuming no slashing.
     */
    total: ValueView;
    tokens: ValueView[];
  };
}

export interface StakingSlice {
  /** The account for which we're viewing delegations. */
  account: number;
  /** Switch to view a different account. */
  setAccount: (account: number) => void;
  /** A map of numeric account indexes to delegations for that account. */
  delegationsByAccount: Map<number, ValueView[]>;
  /**
   * A map of numeric account indexes to information about unbonding tokens for
   * that account.
   */
  unbondingTokensByAccount: Map<number, UnbondingTokensForAccount>;
  /**
   * Load all delegations for the currently selected account, and save them into
   * `delegationsByAccount`. Should be called each time `account` is changed.
   */
  loadDelegationsForCurrentAccount: () => Promise<void>;
  loadDelegationsForCurrentAccountAbortController?: AbortController;
  /**
   * Load all unbonding tokens for the currently selected account, and save them
   * into `unbondingTokensByAccount`. Should be called each time `account` is
   * changed.
   */
  loadUnbondingTokensForCurrentAccount: () => Promise<void>;
  loadUnbondingTokensForCurrentAccountAbortController?: AbortController;
  /**
   * Build and submit the Delegate transaction.
   */
  delegate: () => Promise<void>;
  /**
   * Build and submit the Undelegate transaction.
   */
  undelegate: () => Promise<void>;
  /**
   * Build and submit Undelegate Claim transaction(s).
   */
  undelegateClaim: () => Promise<void>;
  loading: boolean;
  error: unknown;
  votingPowerByValidatorInfo: Record<string, VotingPowerAsIntegerPercentage>;
  /**
   * Called when the user clicks either the Delegate or Undelegate button for a
   * given validator (represented by `validatorInfo`).
   */
  onClickActionButton: (action: 'delegate' | 'undelegate', validatorInfo: ValidatorInfo) => void;
  /**
   * Called when the user closes the delegate or undelegate form without
   * submitting it.
   */
  onClose: () => void;
  setAmount: (amount: string) => void;
  /**
   * The action that the user is currently taking. This is populated once the
   * user clicks the "Delegate" or "Undelegate" button, and it is reset to
   * `undefined` when the transaction starts or the user cancels.
   */
  action?: 'delegate' | 'undelegate';
  /**
   * The amount the user has typed into the form that appears after clicking the
   * "Delegate" or "Undelegate" button.
   */
  amount: string;
  /**
   * The `ValidatorInfo` for the validator that the user has clicked the
   * delegate or undelegate button for.
   */
  validatorInfo?: ValidatorInfo;
  stakingTokensAndFilter: ZQueryState<{
    /**
     * A map of numeric account indexes to unstaked (UM) tokens for that account.
     */
    unstakedTokensByAccount: Map<number, ValueView | undefined>;
    /**
     * All accounts for which staking is relevant, to be passed to
     * `<AccountSwitcher />` as the `filter` prop. This includes accounts with:
     * - delegation tokens
     * - unbonding tokens
     * - staking (UM) tokens (since they can be delegated)
     */
    accountSwitcherFilter: number[];
  }>;
}

/**
 * Used with `.sort()` to sort value views by balance and then voting power
 * (both descending).
 */
const byBalanceAndVotingPower = (valueViewA: ValueView, valueViewB: ValueView): number => {
  const byBalance = Number(
    joinLoHiAmount(getAmount(valueViewB)) - joinLoHiAmount(getAmount(valueViewA)),
  );
  if (byBalance !== 0) return byBalance;

  const validatorInfoA = getValidatorInfoFromValueView(valueViewA);
  const validatorInfoB = getValidatorInfoFromValueView(valueViewB);

  const byVotingPower = Number(
    joinLoHiAmount(getVotingPowerFromValidatorInfo(validatorInfoB)) -
      joinLoHiAmount(getVotingPowerFromValidatorInfo(validatorInfoA)),
  );

  return byVotingPower;
};

export const { stakingTokensAndFilter, useStakingTokensAndFilter } = createZQuery({
  name: 'stakingTokensAndFilter',
  fetch: async () => {
    const balancesByAccount = await getBalancesByAccount();

    const stakingTokenMetadata = await getStakingTokenMetadata();

    // It's slightly inefficient to reduce over an array twice, rather than
    // combining the reducers into one. But this is much more readable; and
    // anyway, `balancesByAccount` will be a single-item array for the vast
    // majority of users.
    const unstakedTokensByAccount = balancesByAccount.reduce(
      (acc: Map<number, ValueView>, cur: BalancesByAccount) =>
        toUnstakedTokensByAccount(acc, cur, stakingTokenMetadata),
      new Map(),
    );
    const accountSwitcherFilter = balancesByAccount.reduce(
      (acc: number[], cur: BalancesByAccount) =>
        toAccountSwitcherFilter(acc, cur, stakingTokenMetadata),
      [],
    );

    return { unstakedTokensByAccount, accountSwitcherFilter };
  },
  getUseStore: () => useStore,
  get: state => state.staking.stakingTokensAndFilter,
  set: setter => {
    const newState = setter(useStore.getState().staking.stakingTokensAndFilter);
    useStore.setState(state => {
      state.staking.stakingTokensAndFilter = newState;
    });
  },
});

/**
 * Tuned to give optimal performance when throttling the rendering delegation
 * tokens.
 */
export const THROTTLE_MS = 200;

export const createStakingSlice = (): SliceCreator<StakingSlice> => (set, get) => ({
  stakingTokensAndFilter,
  account: 0,
  setAccount: (account: number) =>
    set(state => {
      state.staking.account = account;
    }),
  action: undefined,
  amount: '',
  validatorInfo: undefined,
  onClickActionButton: (action, validatorInfo) =>
    set(state => {
      state.staking.action = action;
      state.staking.validatorInfo = validatorInfo;
    }),
  onClose: () =>
    set(state => {
      state.staking.action = undefined;
    }),
  setAmount: amount =>
    set(state => {
      state.staking.amount = amount;
    }),
  delegationsByAccount: new Map(),
  unbondingTokensByAccount: new Map(),
  loadDelegationsForCurrentAccount: async () => {
    const existingAbortController = get().staking.loadDelegationsForCurrentAccountAbortController;
    if (existingAbortController) existingAbortController.abort();
    const newAbortController = new AbortController();
    set(state => {
      state.staking.loadDelegationsForCurrentAccountAbortController = newAbortController;
    });

    const addressIndex = new AddressIndex({ account: get().staking.account });
    const validatorInfos: ValidatorInfo[] = [];

    set(state => {
      state.staking.delegationsByAccount.set(addressIndex.account, []);
      state.staking.votingPowerByValidatorInfo = {};
      state.staking.loading = true;
    });

    let delegationsToFlush: ValueView[] = [];

    /**
     * Per the RPC call, we get delegations in a stream, one-by-one. If we push
     * them to state as we receive them, React has to re-render super
     * frequently. Rendering happens synchronously, which means that the `for`
     * loop below has to wait until rendering is done before moving on to the
     * next delegation. Thus, the staking page loads super slowly if we render
     * delegations as soon as we receive them.
     *
     * To resolve this performance issue, we instead queue up a number of
     * delegations and then flush them to state in batches.
     */
    const flushToState = () => {
      if (!delegationsToFlush.length) return;

      const delegations = get().staking.delegationsByAccount.get(addressIndex.account) ?? [];

      const sortedDelegations = [...delegations, ...delegationsToFlush].sort(
        byBalanceAndVotingPower,
      );

      set(state => {
        state.staking.delegationsByAccount.set(addressIndex.account, sortedDelegations);
      });

      delegationsToFlush = [];
    };
    const throttledFlushToState = throttle(flushToState, THROTTLE_MS, { trailing: true });

    for await (const response of viewClient.delegationsByAddressIndex({ addressIndex })) {
      if (newAbortController.signal.aborted) {
        throttledFlushToState.cancel();
        return;
      }

      const delegation = getValueViewFromDelegationsByAddressIndexResponse(response);
      delegationsToFlush.push(delegation);
      validatorInfos.push(getValidatorInfoFromValueView(delegation));

      throttledFlushToState();
    }

    /**
     * We can only calculate _each_ validator's percentage voting power once
     * we've loaded _all_ voting powers.
     */
    set(state => {
      state.staking.votingPowerByValidatorInfo = getVotingPowerByValidatorInfo(validatorInfos);
      state.staking.loading = false;
    });
  },
  loadUnbondingTokensForCurrentAccount: async () => {
    const existingAbortController =
      get().staking.loadUnbondingTokensForCurrentAccountAbortController;
    if (existingAbortController) existingAbortController.abort();
    const newAbortController = new AbortController();
    set(state => {
      state.staking.loadUnbondingTokensForCurrentAccountAbortController = newAbortController;
    });

    const addressIndex = new AddressIndex({ account: get().staking.account });

    set(state => {
      state.staking.unbondingTokensByAccount.delete(addressIndex.account);
    });

    const responses = await Array.fromAsync(
      viewClient.unbondingTokensByAddressIndex({ addressIndex }),
    );
    const stakingTokenMetadata = await getStakingTokenMetadata();

    const unbondingTokensForAccount = responses.reduce<UnbondingTokensForAccount>(
      (acc, curr) => toUnbondingTokensForAccount(acc, curr, stakingTokenMetadata),
      {
        claimable: { total: zeroValueView(stakingTokenMetadata), tokens: [] },
        notYetClaimable: { total: zeroValueView(stakingTokenMetadata), tokens: [] },
      },
    );

    set(state => {
      state.staking.unbondingTokensByAccount.set(addressIndex.account, unbondingTokensForAccount);
    });
  },
  delegate: async () => {
    try {
      const stakingTokenMetadata = await getStakingTokenMetadata();

      const req = assembleDelegateRequest(get().staking, stakingTokenMetadata);

      // Reset form _after_ building the transaction planner request, since it depends on
      // the state.
      set(state => {
        state.staking.action = undefined;
        state.staking.validatorInfo = undefined;
      });

      await planBuildBroadcast('delegate', req);

      // Reload delegation tokens and unstaked tokens to reflect their updated
      // balances.
      void get().staking.loadDelegationsForCurrentAccount();
      get().staking.stakingTokensAndFilter.revalidate();
    } finally {
      set(state => {
        state.staking.amount = '';
      });
    }
  },
  undelegate: async () => {
    try {
      const req = assembleUndelegateRequest(get().staking);

      // Reset form _after_ assembling the transaction planner request, since it
      // depends on the state.
      set(state => {
        state.staking.action = undefined;
        state.staking.validatorInfo = undefined;
      });

      await planBuildBroadcast('undelegate', req);

      // Reload delegation tokens and unstaked tokens to reflect their updated
      // balances.
      void get().staking.loadDelegationsForCurrentAccount();
      get().staking.stakingTokensAndFilter.revalidate();
      void get().staking.loadUnbondingTokensForCurrentAccount();
    } finally {
      set(state => {
        state.staking.amount = '';
      });
    }
  },
  undelegateClaim: async () => {
    const { account, unbondingTokensByAccount } = get().staking;
    const unbondingTokens = unbondingTokensByAccount.get(account)?.claimable.tokens;
    if (!unbondingTokens) return;

    try {
      const req = await assembleUndelegateClaimRequest({ account, unbondingTokens });
      if (!req) return;

      await planBuildBroadcast('undelegateClaim', req);

      // Reset form _after_ assembling the transaction planner request, since it
      // depends on the state.
      set(state => {
        state.staking.action = undefined;
        state.staking.validatorInfo = undefined;
      });

      // Reload unbonding tokens and unstaked tokens to reflect their updated
      // balances.
      get().staking.stakingTokensAndFilter.revalidate();
      void get().staking.loadUnbondingTokensForCurrentAccount();
    } finally {
      set(state => {
        state.staking.amount = '';
      });
    }
  },
  loading: false,
  error: undefined,
  votingPowerByValidatorInfo: {},
});

const assembleDelegateRequest = (
  { account, amount, validatorInfo }: StakingSlice,
  stakingAssetMetadata: Metadata,
) => {
  return new TransactionPlannerRequest({
    delegations: [
      {
        amount: toBaseUnit(BigNumber(amount), getDisplayDenomExponent(stakingAssetMetadata)),
        rateData: getRateData(validatorInfo),
      },
    ],
    source: { account },
  });
};

const assembleUndelegateRequest = ({
  account,
  amount,
  delegationsByAccount,
  validatorInfo,
}: StakingSlice) => {
  const delegation = delegationsByAccount
    .get(account)
    ?.find(delegation => isDelegationTokenForValidator(delegation, validatorInfo!));
  if (!delegation)
    throw new Error('Tried to assemble undelegate request from account with no delegation tokens');

  return new TransactionPlannerRequest({
    undelegations: [
      {
        rateData: getRateData(validatorInfo),
        value: {
          amount: toBaseUnit(BigNumber(amount), getDisplayDenomExponentFromValueView(delegation)),
          assetId: getAssetIdFromValueView(delegation),
        },
      },
    ],
    source: { account },
  });
};

/**
 * Function to use with `reduce()` over an array of `BalancesByAccount` objects.
 * Returns a map of accounts to `ValueView`s of the staking token.
 */
const toUnstakedTokensByAccount = (
  unstakedTokensByAccount: Map<number, ValueView>,
  curr: BalancesByAccount,
  stakingTokenMetadata: Metadata,
) => {
  const stakingTokenBalance = curr.balances.find(
    ({ balanceView }) => getDisplayDenomFromView(balanceView) === stakingTokenMetadata.display,
  );

  if (stakingTokenBalance?.balanceView) {
    unstakedTokensByAccount.set(curr.account, stakingTokenBalance.balanceView);
  }

  return unstakedTokensByAccount;
};

/**
 * Function to use with `reduce()` over an array of `BalancesByAccount` objects.
 * Reduces to an array of accounts that have relevant balances for staking.
 */
const toAccountSwitcherFilter = (
  accountSwitcherFilter: number[],
  curr: BalancesByAccount,
  stakingTokenMetadata: Metadata,
) => {
  const isRelevantAccount = curr.balances.some(({ balanceView }) => {
    const displayDenom = getDisplayDenomFromView(balanceView);

    return (
      assetPatterns.delegationToken.matches(displayDenom) ||
      assetPatterns.unbondingToken.matches(displayDenom) ||
      displayDenom === stakingTokenMetadata.display
    );
  });

  if (isRelevantAccount) return [...accountSwitcherFilter, curr.account];
  return accountSwitcherFilter;
};

/**
 * Function to use with `reduce()` over an array of `BalancesByAccount` objects.
 * Returns a map of accounts to `ValueView`s of the staking token.
 */
const toUnbondingTokensForAccount = (
  unbondingTokensForAccount: UnbondingTokensForAccount,
  curr: UnbondingTokensByAddressIndexResponse,
  stakingTokenMetadata: Metadata,
): UnbondingTokensForAccount => {
  const valueView = getValueViewFromUnbondingTokensByAddressIndexResponse(curr);

  if (curr.claimable) {
    unbondingTokensForAccount.claimable.tokens.push(valueView);
  } else {
    unbondingTokensForAccount.notYetClaimable.tokens.push(valueView);
  }

  const claimableTotal = unbondingTokensForAccount.claimable.tokens.reduce<bigint>(
    (prev, curr) => prev + joinLoHiAmount(getAmount(curr)),
    0n,
  );

  unbondingTokensForAccount.claimable.total = new ValueView({
    valueView: {
      case: 'knownAssetId',
      value: {
        amount: splitLoHi(claimableTotal),
        metadata: stakingTokenMetadata,
      },
    },
  });

  const notYetClaimableTotal = unbondingTokensForAccount.notYetClaimable.tokens.reduce<bigint>(
    (prev, curr) => prev + joinLoHiAmount(getAmount(curr)),
    0n,
  );

  unbondingTokensForAccount.notYetClaimable.total = new ValueView({
    valueView: {
      case: 'knownAssetId',
      value: {
        amount: splitLoHi(notYetClaimableTotal),
        metadata: stakingTokenMetadata,
      },
    },
  });

  return unbondingTokensForAccount;
};
