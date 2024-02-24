import { LoaderFunction } from 'react-router-dom';
import { BalancesByAccount, getBalancesByAccount } from '../../fetchers/balances/by-account';
import { throwIfExtNotInstalled } from '../../utils/is-connected';
import { Accounts } from './accounts';
import { cn } from '@penumbra-zone/ui/lib/utils';
import { AllValidators } from './all-validators';
import { useStore } from '../../state';

export const StakingLoader: LoaderFunction = async (): Promise<BalancesByAccount[]> => {
  throwIfExtNotInstalled();

  void useStore.getState().staking.loadValidators();

  const balancesByAccount = await getBalancesByAccount();
  return balancesByAccount;
};

const GAPS = 'gap-6 md:gap-4 xl:gap-5';

export const StakingLayout = () => {
  return (
    <div className={cn('flex flex-col', GAPS)}>
      <Accounts />

      <AllValidators />
    </div>
  );
};
