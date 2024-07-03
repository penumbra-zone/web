import { useMemo } from 'react';
import {
  BalancesByAccount,
  balancesByAccountSelector,
  useBalancesResponses,
  useStakingTokenMetadata,
} from '../../../state/shared';
import {
  Metadata,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { getDisplayDenomFromView } from '@penumbra-zone/getters/value-view';
import { assetPatterns } from '@penumbra-zone/types/assets';

/**
 * Function to use with `reduce()` over an array of `BalancesByAccount` objects.
 * Returns a map of accounts to `ValueView`s of the staking token.
 */
const toStakingTokensByAccount = (
  stakingTokensByAccount: Map<number, ValueView | undefined>,
  curr: BalancesByAccount,
  stakingTokenMetadata: Metadata,
) => {
  const stakingTokenBalance = curr.balances.find(
    ({ balanceView }) => getDisplayDenomFromView(balanceView) === stakingTokenMetadata.display,
  );

  if (stakingTokenBalance?.balanceView) {
    stakingTokensByAccount.set(curr.account, stakingTokenBalance.balanceView);
  }

  return stakingTokensByAccount;
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

export const useStakingTokensAndFilter = (
  account: number,
): { stakingTokens?: ValueView; accountSwitcherFilter: number[] } => {
  const { data: stakingTokenMetadata } = useStakingTokenMetadata();
  const balancesByAccount = useBalancesResponses({
    select: balancesByAccountSelector,
    shouldReselect: (before, after) => before?.data === after.data,
  });

  const stakingTokensByAccount = useMemo(() => {
    if (!stakingTokenMetadata || !balancesByAccount) {
      return new Map<number, ValueView | undefined>();
    }

    return balancesByAccount.reduce(
      (acc: Map<number, ValueView | undefined>, cur: BalancesByAccount) =>
        toStakingTokensByAccount(acc, cur, stakingTokenMetadata),
      new Map(),
    );
  }, [stakingTokenMetadata, balancesByAccount]);

  const accountSwitcherFilter = useMemo(() => {
    if (!stakingTokenMetadata || !balancesByAccount) return [];

    return balancesByAccount.reduce<number[]>(
      (prev, curr) => toAccountSwitcherFilter(prev, curr, stakingTokenMetadata),
      [],
    );
  }, [balancesByAccount]);

  const stakingTokens = stakingTokensByAccount.get(account);

  return { stakingTokens, accountSwitcherFilter };
};
