import { Card } from '@penumbra-zone/ui/components/ui/card';
import { EduPanel } from '../../shared/edu-panels/content';
import { EduInfoCard } from '../../shared/edu-panels/edu-info-card';
import { DutchAuctionForm } from './dutch-auction-form';

export const DutchAuction = () => {
  return (
    <div className='grid gap-6 md:grid-cols-2 md:gap-4 xl:grid-cols-3 xl:gap-5'>
      <div className='hidden xl:block'></div>

      <Card gradient className='order-3 row-span-2 flex-1 p-5 md:order-1 md:p-4 xl:p-5'>
        <DutchAuctionForm />
      </Card>

      <EduInfoCard
        className='row-span-1 md:order-2'
        src='./auction-gradient.svg'
        label='Dutch Auction'
        content={EduPanel.SWAP_AUCTION}
      />
    </div>
  );
};
