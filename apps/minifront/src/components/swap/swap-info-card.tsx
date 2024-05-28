import { AllSlices } from '../../state';
import { useStoreShallow } from '../../utils/use-store-shallow';
import { EduPanel } from '../shared/edu-panels/content';
import { EduInfoCard } from '../shared/edu-panels/edu-info-card';

const swapInfoCardSelector = (state: AllSlices) => {
  if (state.swap.duration === 'instant') {
    return {
      src: './swap-icon.svg',
      label: 'Shielded Swap',
      content: EduPanel.SWAP,
    };
  }

  return {
    src: './auction-gradient.svg',
    label: 'Dutch Auction',
    content: EduPanel.SWAP_AUCTION,
  };
};

/**
 * Renders an `EduInfoCard` for either swaps or Dutch auctions, depending on the
 * value of the duration slider.
 */
export const SwapInfoCard = () => {
  const props = useStoreShallow(swapInfoCardSelector);

  return <EduInfoCard {...props} />;
};
