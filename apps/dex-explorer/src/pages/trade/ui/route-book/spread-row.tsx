import { Text } from '@penumbra-zone/ui/Text';
import type { Trace } from '@/shared/api/server/book/types';
import { calculateSpread } from '../../model/trace';
import { usePathSymbols } from '../../model/use-path';
import { formatNumber } from './utils';

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
    <div className='col-span-4 flex items-center h-full justify-center gap-2 px-3 py-3 text-xs border-b border-b-other-tonalStroke'>
      <Text detailTechnical color='success.light'>
        {formatNumber(spreadInfo.midPrice, 7)}
      </Text>
      <Text detailTechnical color='text.secondary'>
        Spread:
      </Text>
      <Text detailTechnical color='text.primary'>
        {formatNumber(spreadInfo.amount, 6)} {pair.quoteSymbol}
      </Text>
      <Text detailTechnical color='text.secondary'>
        ({parseFloat(spreadInfo.percentage).toFixed(2)}%)
      </Text>
    </div>
  );
};
