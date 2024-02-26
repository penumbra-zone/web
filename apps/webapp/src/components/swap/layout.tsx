import { Card } from '@penumbra-zone/ui';
import { EduInfoCard } from '../shared/edu-panels/edu-info-card';
import { EduPanel } from '../shared/edu-panels/content';
import { SwapForm } from './swap-form';
import { UnclaimedSwaps } from './unclaimed-swaps';

export const SwapLayout = () => {
  return (
    <div className='grid gap-6 md:grid-cols-2 md:gap-4 xl:grid-cols-3 xl:gap-5'>
      <div className='xl:order-1 xl:block'>
        <UnclaimedSwaps />
      </div>
      <Card gradient className='order-2 row-span-2 flex-1 p-5 md:order-1 md:p-4 xl:p-5'>
        <SwapForm />
      </Card>
      <EduInfoCard
        className='order-1 md:order-2'
        src='./swap-icon.svg'
        label='Shielded Swap'
        content={EduPanel.SWAP}
      />
    </div>
  );
};
