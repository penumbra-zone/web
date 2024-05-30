import { RestrictMaxWidth } from '../shared/restrict-max-width';
import { SwapForm } from './swap-form';
import { UnclaimedSwaps } from './unclaimed-swaps';
import { AuctionList } from './auction-list';
import { SwapInfoCard } from './swap-info-card';
import { LayoutGroup } from 'framer-motion';

export const SwapLayout = () => {
  return (
    <RestrictMaxWidth>
      <LayoutGroup>
        <div className='grid w-full grid-std-spacing md:grid-cols-3'>
          <div className='flex flex-col overflow-hidden grid-std-spacing md:col-span-2'>
            <SwapForm />

            <AuctionList />
          </div>

          <div className='flex flex-col grid-std-spacing'>
            <SwapInfoCard />

            <UnclaimedSwaps />
          </div>
        </div>
      </LayoutGroup>
    </RestrictMaxWidth>
  );
};
