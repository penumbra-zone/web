import { LoaderFunction } from 'react-router-dom';
import { BalancesByAccount, getBalancesByAccount } from '../../fetchers/balances/by-account';
import { throwIfExtNotInstalled } from '../../utils/is-connected';
import { EduInfoCard } from '../shared/edu-panels/edu-info-card';
import { EduPanel } from '../shared/edu-panels/content';
import { ValidatorsTable } from './validators-table';
import { Accounts } from './accounts';
import { cn } from '@penumbra-zone/ui/lib/utils';

export const StakingLoader: LoaderFunction = async (): Promise<BalancesByAccount[]> => {
  throwIfExtNotInstalled();
  const balancesByAccount = await getBalancesByAccount();
  return balancesByAccount;
};

const GAPS = 'gap-6 md:gap-4 xl:gap-5';

export const StakingLayout = () => {
  return (
    <div className={cn('grid md:grid-cols-3', GAPS)}>
      <div className={cn('col-span-2 flex flex-col', GAPS)}>
        <Accounts />

        <ValidatorsTable />
      </div>

      <div>
        <EduInfoCard label='Staking' content={EduPanel.STAKING} src='./nodes-icon.svg' />
      </div>
    </div>
  );
};
