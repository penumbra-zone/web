import { useEffect } from 'react';
import { AllSlices, useStore } from '../../state';
import { throwIfPraxNotConnectedTimeout } from '@penumbra-zone/client';
import { Card, CardContent, CardHeader, CardTitle } from '@penumbra-zone/ui/components/ui/card';
import { Header } from './account/header';
import { Delegations } from './account/delegations';
import { LoaderFunction } from 'react-router-dom';
import { useStoreShallow } from '../../utils/use-store-shallow';

export const StakingLoader: LoaderFunction = async () => {
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

  return (
    <div className='mx-auto max-w-[1276px]'>
      <div className='flex flex-col gap-4'>
        <Header />
        <Card>
          <CardHeader>
            <CardTitle>Delegation tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <Delegations />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
