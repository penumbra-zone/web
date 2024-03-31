import { useEffect } from 'react';
import { useStore } from '../../state';
import { stakingSelector } from '../../state/staking';
import { throwIfPraxNotConnectedTimeout } from '@penumbra-zone/client';
import { Account } from './account';

export const StakingLoader = async () => {
  await throwIfPraxNotConnectedTimeout();
  // Await to avoid screen flicker.
  await useStore.getState().staking.loadAndReduceBalances();

  return null;
};

export const StakingLayout = () => {
  const { account, loadDelegationsForCurrentAccount, loadUnbondingTokensForCurrentAccount } =
    useStore(stakingSelector);

  /** Load delegations every time the account changes. */
  useEffect(() => {
    void loadDelegationsForCurrentAccount();
    void loadUnbondingTokensForCurrentAccount();
  }, [account, loadDelegationsForCurrentAccount, loadUnbondingTokensForCurrentAccount]);

  return <Account />;
};
