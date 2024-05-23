import { useEffect } from 'react';
import { AllSlices, useStore } from '../../state';
import { Card, CardContent, CardHeader, CardTitle } from '@penumbra-zone/ui/components/ui/card';
import { Header } from './account/header';
import { Delegations } from './account/delegations';
import { LoaderFunction, useLoaderData } from 'react-router-dom';
import { useStoreShallow } from '../../utils/use-store-shallow';
import { RestrictMaxWidth } from '../shared/restrict-max-width';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { getStakingTokenMetadata } from '../../fetchers/registry';

export const StakingLoader: LoaderFunction = async (): Promise<Metadata> => {
  // Await to avoid screen flicker.
  await useStore.getState().staking.loadAndReduceBalances();

  return await getStakingTokenMetadata();
};

const stakingLayoutSelector = (state: AllSlices) => ({
  account: state.staking.account,
  loadDelegationsForCurrentAccount: state.staking.loadDelegationsForCurrentAccount,
  loadUnbondingTokensForCurrentAccount: state.staking.loadUnbondingTokensForCurrentAccount,
});

export const StakingLayout = () => {
  const stakingTokenMetadata = useLoaderData() as Metadata;
  const { account, loadDelegationsForCurrentAccount, loadUnbondingTokensForCurrentAccount } =
    useStoreShallow(stakingLayoutSelector);

  /** Load delegations every time the account changes. */
  useEffect(() => {
    void loadDelegationsForCurrentAccount();
    void loadUnbondingTokensForCurrentAccount();
  }, [account, loadDelegationsForCurrentAccount, loadUnbondingTokensForCurrentAccount]);

  return (
    <RestrictMaxWidth>
      <div className='flex flex-col gap-4'>
        <Header />
        <Card>
          <CardHeader>
            <CardTitle>Delegation tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <Delegations stakingTokenMetadata={stakingTokenMetadata} />
          </CardContent>
        </Card>
      </div>
    </RestrictMaxWidth>
  );
};
