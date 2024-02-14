import { Card } from '@penumbra-zone/ui';
import { EduInfoCard } from '../shared/edu-panels/edu-info-card';
import { EduPanel } from '../shared/edu-panels/content';
import { SwapForm } from './swap-form';
import { UnclaimedSwaps } from './unclaimed-swaps.tsx';

export const SwapLayout = () => {
  return (
    <div className='relative mx-auto grid gap-6 md:grid-cols-2 md:gap-4 xl:max-w-[1276px] xl:grid-cols-3 xl:gap-5'>
      <div className='xl:order-1 xl:block'>
        <UnclaimedSwaps />
      </div>
      <Card gradient className='order-2 row-span-2 flex-1 p-5 md:order-1 md:p-4 xl:p-5'>
        <SwapForm />
      </Card>
      <EduInfoCard
        className='order-1 md:order-2'
        src='./receive-gradient.svg'
        label='Swap me'
        content={EduPanel.TEMP_FILLER}
      />
    </div>
  );
};
