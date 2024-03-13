import { ValidatorInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';
import { AllSlices, SliceCreator } from '..';
import { getDisplayDenomExponent } from '@penumbra-zone/getters/src/metadata';
import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { BalancesByAccount, getBalancesByAccount } from '../../fetchers/balances/by-account';
import {
  assetPatterns,
  localAssets,
  STAKING_TOKEN,
  STAKING_TOKEN_METADATA,
} from '@penumbra-zone/constants/src/assets';
import { AddressIndex } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { TransactionToast } from '@penumbra-zone/ui';
import { authWitnessBuild, broadcast, getTxHash, plan, userDeniedTransaction } from '../helpers';
import { TransactionPlannerRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { BigNumber } from 'bignumber.js';
import { assembleUndelegateClaimRequest } from './assemble-undelegate-claim-request';
import throttle from 'lodash/throttle';
import {
  getAmount,
  getAssetIdFromValueView,
  getDisplayDenomExponentFromValueView,
  getDisplayDenomFromView,
  getValidatorInfoFromValueView,
} from '@penumbra-zone/getters/src/value-view';
import {
  getRateData,
  getVotingPowerFromValidatorInfo,
} from '@penumbra-zone/getters/src/validator-info';
import {
  getVotingPowerByValidatorInfo,
  isDelegationTokenForValidator,
  VotingPowerAsIntegerPercentage,
} from '@penumbra-zone/types/src/staking';
import { joinLoHiAmount } from '@penumbra-zone/types/src/amount';
import { splitLoHi, toBaseUnit } from '@penumbra-zone/types/src/lo-hi';
import { viewClient } from '../../clients';
import { getValueView } from '@penumbra-zone/getters/src/delegations-by-address-index-response';

const STAKING_TOKEN_DISPLAY_DENOM_EXPONENT = (() => {
  const stakingAsset = localAssets.find(asset => asset.display === STAKING_TOKEN);
  return getDisplayDenomExponent(stakingAsset);
})();

interface UnbondingTokensForAccount {
  /**
   * The total value of all unbonding tokens in this account, in the staking
   * token. This is what they will be worth once claimed, assuming no slashing.
   */
  total: ValueView;
  tokens: ValueView[];
}

export interface StakingSlice {
  /** The account for which we're viewing delegations. */
  account: number;
  /** Switch to view a different account. */
  setAccount: (account: number) => void;
  /** A map of numeric account indexes to delegations for that account. */
  delegationsByAccount: Map<number, ValueView[]>;
  /**
   * A map of numeric account indexes to unstaked (UM) tokens for that account.
   */
  unstakedTokensByAccount: Map<number, ValueView | undefined>;
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
  loadUnstakedAndUnbondingTokensByAccount: () => Promise<void>;
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

/**
 * Tuned to give optimal performance when throttling the rendering delegation
 * tokens.
 */
export const THROTTLE_MS = 200;

export const createStakingSlice = (): SliceCreator<StakingSlice> => (set, get) => ({
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
  unstakedTokensByAccount: new Map(),
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

      const delegation = getValueView(response);
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
  loadUnstakedAndUnbondingTokensByAccount: async () => {
    const balancesByAccount = await getBalancesByAccount();

    const unstakedTokensByAccount = balancesByAccount.reduce(toUnstakedTokensByAccount, new Map());

    const unbondingTokensByAccount = balancesByAccount.reduce(
      toUnbondingTokensByAccount,
      new Map(),
    );

    set(state => {
      state.staking.unstakedTokensByAccount = unstakedTokensByAccount;
      state.staking.unbondingTokensByAccount = unbondingTokensByAccount;
    });
  },
  delegate: async () => {
    const toast = new TransactionToast('delegate');
    toast.onStart();

    try {
      const transactionPlan = await plan(assembleDelegateRequest(get().staking));

      // Reset form _after_ building the transaction planner request, since it depends on
      // the state.
      set(state => {
        state.staking.action = undefined;
        state.staking.validatorInfo = undefined;
      });

      const transaction = await authWitnessBuild({ transactionPlan }, status =>
        toast.onBuildStatus(status),
      );
      const txHash = await getTxHash(transaction);
      toast.txHash(txHash);
      const { detectionHeight } = await broadcast({ transaction, awaitDetection: true }, status =>
        toast.onBroadcastStatus(status),
      );
      toast.onSuccess(detectionHeight);

      // Reload delegation tokens and unstaked tokens to reflect their updated
      // balances.
      void get().staking.loadDelegationsForCurrentAccount();
      void get().staking.loadUnstakedAndUnbondingTokensByAccount();
    } catch (e) {
      if (userDeniedTransaction(e)) {
        toast.onDenied();
      } else {
        toast.onFailure(e);
      }
    } finally {
      set(state => {
        state.staking.amount = '';
      });
    }
  },
  undelegate: async () => {
    const toast = new TransactionToast('undelegate');
    toast.onStart();

    try {
      const transactionPlan = await plan(assembleUndelegateRequest(get().staking));

      // Reset form _after_ assembling the transaction planner request, since it
      // depends on the state.
      set(state => {
        state.staking.action = undefined;
        state.staking.validatorInfo = undefined;
      });

      const transaction = await authWitnessBuild({ transactionPlan }, status =>
        toast.onBuildStatus(status),
      );
      const txHash = await getTxHash(transaction);
      toast.txHash(txHash);
      const { detectionHeight } = await broadcast({ transaction, awaitDetection: true }, status =>
        toast.onBroadcastStatus(status),
      );
      toast.onSuccess(detectionHeight);

      // Reload delegation tokens and unstaked tokens to reflect their updated
      // balances.
      void get().staking.loadDelegationsForCurrentAccount();
      void get().staking.loadUnstakedAndUnbondingTokensByAccount();
    } catch (e) {
      if (userDeniedTransaction(e)) {
        toast.onDenied();
      } else {
        toast.onFailure(e);
      }
    } finally {
      set(state => {
        state.staking.amount = '';
      });
    }
  },
  undelegateClaim: async () => {
    const { account, unbondingTokensByAccount } = get().staking;
    const unbondingTokens = unbondingTokensByAccount.get(account)?.tokens;
    if (!unbondingTokens) return;
    const toast = new TransactionToast('undelegateClaim');
    toast.onStart();

    try {
      const req = await assembleUndelegateClaimRequest({ account, unbondingTokens });
      if (!req) return;
      const transactionPlan = await plan(req);

      // Reset form _after_ assembling the transaction planner request, since it
      // depends on the state.
      set(state => {
        state.staking.action = undefined;
        state.staking.validatorInfo = undefined;
      });

      const transaction = await authWitnessBuild({ transactionPlan }, status =>
        toast.onBuildStatus(status),
      );
      const txHash = await getTxHash(transaction);
      toast.txHash(txHash);
      const { detectionHeight } = await broadcast({ transaction, awaitDetection: true }, status =>
        toast.onBroadcastStatus(status),
      );
      toast.onSuccess(detectionHeight);

      // Reload unbonding tokens and unstaked tokens to reflect their updated
      // balances.
      void get().staking.loadUnstakedAndUnbondingTokensByAccount();
    } catch (e) {
      if (userDeniedTransaction(e)) {
        toast.onDenied();
      } else {
        toast.onFailure(e);
      }
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

export const stakingSelector = (state: AllSlices) => state.staking;

/**
 * Selector to get all accounts that are relevant to staking (in the form of
 * their numeric address index). This includes accounts that:
 * 1. have unstaked UM tokens.
 * 2. have delegation tokens.
 * 3. have unbonding tokens.
 */
export const accountsSelector = (state: AllSlices): number[] => {
  const accounts = new Set<number>();

  for (const account of state.staking.unstakedTokensByAccount.keys()) {
    if (state.staking.unstakedTokensByAccount.get(account)) accounts.add(account);
  }

  for (const account of state.staking.delegationsByAccount.keys()) {
    const delegations = state.staking.delegationsByAccount.get(account);
    if (delegations?.length) accounts.add(account);
  }

  for (const account of state.staking.unbondingTokensByAccount.keys()) {
    const unbondingTokens = state.staking.unbondingTokensByAccount.get(account)?.tokens;
    if (unbondingTokens?.length) accounts.add(account);
  }

  return Array.from(accounts.values());
};

const assembleDelegateRequest = ({ account, amount, validatorInfo }: StakingSlice) => {
  return new TransactionPlannerRequest({
    delegations: [
      {
        amount: toBaseUnit(BigNumber(amount), STAKING_TOKEN_DISPLAY_DENOM_EXPONENT),
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
) => {
  const stakingTokenBalance = curr.balances.find(
    ({ balanceView }) => getDisplayDenomFromView(balanceView) === STAKING_TOKEN,
  );

  if (stakingTokenBalance?.balanceView)
    unstakedTokensByAccount.set(curr.index.account, stakingTokenBalance.balanceView);

  return unstakedTokensByAccount;
};

/**
 * Function to use with `reduce()` over an array of `BalancesByAccount` objects.
 * Returns a map of accounts to `ValueView`s of the staking token.
 */
const toUnbondingTokensByAccount = (
  unbondingTokensByAccount: Map<number, UnbondingTokensForAccount>,
  curr: BalancesByAccount,
) => {
  const unbondingTokens = curr.balances
    .filter(({ balanceView }) =>
      assetPatterns.unbondingToken.test(getDisplayDenomFromView(balanceView)),
    )
    .map(({ balanceView }) => balanceView!);

  if (unbondingTokens.length) {
    const unbondingTotalAmount = unbondingTokens.reduce<bigint>(
      (prev, curr) => prev + joinLoHiAmount(getAmount(curr)),
      0n,
    );

    const unbondingTotal = new ValueView({
      valueView: {
        case: 'knownAssetId',
        value: {
          amount: splitLoHi(unbondingTotalAmount),
          metadata: STAKING_TOKEN_METADATA,
        },
      },
    });

    unbondingTokensByAccount.set(curr.index.account, {
      tokens: unbondingTokens,
      total: unbondingTotal,
    });
  }

  return unbondingTokensByAccount;
};
