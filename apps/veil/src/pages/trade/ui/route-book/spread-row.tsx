import { Text } from '@penumbra-zone/ui/Text';
import type { Trace } from '@/shared/api/server/book/types';
import { calculateSpread } from '../../model/trace';
import { usePathSymbols } from '../../model/use-path';
import { pnum } from '@penumbra-zone/types/pnum';

export const SpreadRow = ({
  sellOrders,
  buyOrders,
}: {
  sellOrders: Trace[];
  buyOrders: Trace[];
}) => {
  const spreadInfo = calculateSpread(sellOrders, buyOrders);
  const pair = usePathSymbols();

  if (!spreadInfo) {
    return null;
  }

  return (
    <div className='col-span-4 flex h-full items-center justify-center gap-2 border-b border-b-other-tonal-stroke px-3 py-3 text-xs'>
      <Text detailTechnical color='success.light'>
        {pnum(spreadInfo.midPrice).toFormattedString({
          commas: false,
          decimals: 7,
        })}
      </Text>
      <Text detailTechnical color='text.secondary'>
        Spread:
      </Text>
      <Text detailTechnical color='text.primary'>
        {pnum(spreadInfo.amount).toFormattedString({
          commas: false,
          decimals: 6,
        })}{' '}
        {pair.quoteSymbol}
      </Text>
      <Text detailTechnical color='text.secondary'>
        ({parseFloat(spreadInfo.percentage).toFixed(2)}%)
      </Text>
    </div>
  );
};
