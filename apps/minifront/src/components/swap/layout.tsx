import { RestrictMaxWidth } from '../shared/restrict-max-width';
import { SwapForm } from './swap-form';
import { UnclaimedSwaps } from './unclaimed-swaps';
import { AuctionList } from './auction-list';
import { GRID_LAYOUT_GAP_CLASSES } from '../constants';
import { SwapInfoCard } from './swap-info-card';

export const SwapLayout = () => {
  return (
    <RestrictMaxWidth>
      <div className={`grid w-full md:grid-cols-3 ${GRID_LAYOUT_GAP_CLASSES}`}>
        <div className={`flex flex-col overflow-hidden md:col-span-2 ${GRID_LAYOUT_GAP_CLASSES}`}>
          <SwapForm />

          <AuctionList />
        </div>

        <div className={`flex flex-col ${GRID_LAYOUT_GAP_CLASSES}`}>
          <SwapInfoCard />

          <UnclaimedSwaps />
        </div>
      </div>
    </RestrictMaxWidth>
  );
};
