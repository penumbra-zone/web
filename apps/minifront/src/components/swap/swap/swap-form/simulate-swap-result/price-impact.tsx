import { formatNumber } from '@penumbra-zone/types/amount';
import { cn } from '@penumbra-zone/ui/lib/utils';

// The price hit the user takes as a consequence of moving the market with the size of their trade
export const PriceImpact = ({ amount = 0 }: { amount?: number }) => {
  // e.g .041234245245 becomes 4.123
  const percent = formatNumber(amount * 100, { precision: 3 });

  return (
    <div className={cn('flex flex-col text-gray-500 text-sm', amount < -0.1 && 'text-orange-400')}>
      {percent}%
    </div>
  );
};
