import { Card } from '@penumbra-zone/ui/components/ui/card';
import { EduInfoCard } from '../../shared/edu-panels/edu-info-card';
import { EduPanel } from '../../shared/edu-panels/content';
import { SwapForm } from '../swap-form';
import { UnclaimedSwaps } from '../unclaimed-swaps';

export const Swap = () => {
  return (
    <div className='grid gap-6 md:grid-cols-2 md:gap-4 xl:grid-cols-3 xl:gap-5'>
      {/* Wrapping in divs prevent one from growing and causing the others to expand with it */}
      <div>
        <UnclaimedSwaps />
      </div>
      <div>
        <Card gradient className='order-3 row-span-2 flex-1 p-5 md:order-1 md:p-4 xl:p-5'>
          <SwapForm />
        </Card>
      </div>
      <div>
        <EduInfoCard
          className='row-span-1 md:order-2'
          src='./swap-icon.svg'
          label='Shielded Swap'
          content={EduPanel.SWAP}
        />
      </div>
    </div>
  );
};
