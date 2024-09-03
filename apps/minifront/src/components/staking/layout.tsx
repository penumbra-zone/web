import { useEffect } from 'react';
import { AllSlices } from '../../state';
import { Card, CardContent, CardHeader, CardTitle } from '@penumbra-zone/ui/components/ui/card';
import { Header } from './account/header';
import { Delegations } from './account/delegations';
import { useStoreShallow } from '../../utils/use-store-shallow';
import { RestrictMaxWidth } from '../shared/restrict-max-width';

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
    <RestrictMaxWidth>
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
    </RestrictMaxWidth>
  );
};
