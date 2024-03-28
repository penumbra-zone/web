import { useEffect } from 'react';
import { useStore } from '../../state';
import { stakingSelector } from '../../state/staking';
import { throwIfPraxNotConnectedTimeout } from '@penumbra-zone/client';
import { Card, CardContent, CardHeader, CardTitle } from '@penumbra-zone/ui/components/ui/card';
import { Header } from './account/header';
import { Delegations } from './account/delegations';
import { LoaderFunction } from 'react-router-dom';

export const StakingLoader: LoaderFunction = async () => {
  await throwIfPraxNotConnectedTimeout();
  // Await to avoid screen flicker.
  await useStore.getState().staking.loadUnstakedAndUnbondingTokensByAccount();

  return null;
};

export const StakingLayout = () => {
  const { account, loadDelegationsForCurrentAccount } = useStore(stakingSelector);

  /** Load delegations every time the account changes. */
  useEffect(
    () => void loadDelegationsForCurrentAccount(),
    [account, loadDelegationsForCurrentAccount],
  );

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
