import { useEffect } from 'react';
import { useStore } from '../../state';
import { stakingSelector } from '../../state/staking';
import { throwIfExtNotInstalled } from '../../utils/is-connected';
import { Account } from './account';

export const StakingLoader = async () => {
  throwIfExtNotInstalled();

  // Await to avoid screen flicker.
  await useStore.getState().staking.loadUnstakedTokensByAccount();

  return null;
};

export const StakingLayout = () => {
  const { account, loadDelegationsForCurrentAccount } = useStore(stakingSelector);

  /** Load delegations every time the account changes. */
  useEffect(
    () => void loadDelegationsForCurrentAccount(),
    [account, loadDelegationsForCurrentAccount],
  );

  return <Account />;
};
