import { useEffect } from 'react';
import { AllSlices, useStore } from '../../state';
import { throwIfPraxNotConnectedTimeout } from '@penumbra-zone/client';
import { Account } from './account';
import { useStoreShallow } from '../../utils/use-store-shallow';

export const StakingLoader = async () => {
  await throwIfPraxNotConnectedTimeout();
  // Await to avoid screen flicker.
  await useStore.getState().staking.loadAndReduceBalances();

  return null;
};

const stakingLayoutSelector = (state: AllSlices) => ({
  account: state.staking.account,
  loadDelegationsForCurrentAccount: state.staking.loadDelegationsForCurrentAccount,
  loadUnbondingTokensForCurrentAccount: state.staking.loadUnbondingTokensForCurrentAccount,
});

export const StakingLayout = () => {
  const { account, loadDelegationsForCurrentAccount, loadUnbondingTokensForCurrentAccount } =
    useStoreShallow(stakingLayoutSelector);

  /** Load delegations every time the account changes. */
  useEffect(() => {
    void loadDelegationsForCurrentAccount();
    void loadUnbondingTokensForCurrentAccount();
  }, [account, loadDelegationsForCurrentAccount, loadUnbondingTokensForCurrentAccount]);

  return <Account />;
};
