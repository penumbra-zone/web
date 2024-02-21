import { EduInfoCard } from '../shared/edu-panels/edu-info-card';
import { EduPanel } from '../shared/edu-panels/content';
import { ValidatorsTable } from './validators-table';

export const StakingLayout = () => {
  return (
    <div className='grid gap-6 md:grid-cols-3 md:gap-4 xl:gap-5'>
      <div className='col-span-2'>
        <ValidatorsTable />
      </div>

      <div>
        <EduInfoCard label='Staking' content={EduPanel.STAKING} src='./nodes-icon.svg' />
      </div>
    </div>
  );
};
