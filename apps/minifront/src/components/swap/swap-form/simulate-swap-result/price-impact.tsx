import { formatNumber } from '@penumbra-zone/types/amount';
import { Pill } from '@repo/ui/components/ui/pill';
import { cn } from '@repo/ui/lib/utils';

// The price hit the user takes as a consequence of moving the market with the size of their trade
export const PriceImpact = ({ amount = 0 }: { amount?: number }) => {
  // e.g .041234245245 becomes 4.123
  const percent = formatNumber(amount * 100, { precision: 3 });

  return (
    <Pill>
      <span className={cn('leading-[15px]', amount < -0.1 && 'text-orange-400')}>{percent}%</span>
    </Pill>
  );
};
