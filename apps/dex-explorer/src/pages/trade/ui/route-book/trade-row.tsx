import { Fragment } from 'react';
import cn from 'clsx';
import { ChevronRight } from 'lucide-react';
import { Text } from '@penumbra-zone/ui/Text';
import { Trace } from '@/shared/api/server/book/types.ts';
import { getSymbolFromValueView } from '@penumbra-zone/getters/value-view';
import { formatNumber } from './utils';

const SELL_BG_COLOR = 'rgba(175, 38, 38, 0.24)';

export const TradeRow = ({
  trace,
  isSell,
  relativeSize,
}: {
  trace: Trace;
  isSell: boolean;
  relativeSize: number;
}) => {
  const bgColor = isSell ? SELL_BG_COLOR : 'rgba(28, 121, 63, 0.24)';
  const tokens = trace.hops.map(valueView => getSymbolFromValueView(valueView));

  return (
    <div
      style={{
        backgroundImage: `linear-gradient(to right, ${bgColor} ${relativeSize}%, transparent ${relativeSize}%)`,
      }}
      className={cn(
        'relative grid grid-cols-subgrid col-span-4 h-full items-center px-4 border-b border-border-faded',
        'after:hidden after:content-[""] after:absolute after:left-0 after:right-0 after:h-full after:bg-other-tonalFill5',
        'group [&:hover>span:not(:last-child)]:invisible hover:after:block',
        'text-xs tabular-nums', // makes all numbers monospaced
      )}
    >
      <Text detailTechnical color={isSell ? 'destructive.light' : 'success.light'}>
        {formatNumber(trace.price, 7)}
      </Text>
      <Text detailTechnical align='right' color='text.primary'>
        {formatNumber(trace.amount, 6)}
      </Text>
      <Text detailTechnical align='right' color='text.primary'>
        {formatNumber(trace.total, 6)}
      </Text>
      <Text
        tableItemSmall
        align='right'
        color={trace.hops.length <= 2 ? 'text.primary' : 'text.special'}
      >
        {trace.hops.length === 2 ? 'Direct' : `${trace.hops.length - 2} Hops`}
      </Text>

      {/* Route display that shows on hover */}
      <div
        className='hidden group-hover:flex justify-center absolute left-0 right-0 px-4 select-none z-30'
        style={{ visibility: 'visible' }}
      >
        <div className='flex items-center gap-1 py-2 text-xs'>
          {tokens.map((token, index) => (
            <Fragment key={index}>
              {index > 0 && <ChevronRight className='w-3 h-3 text-neutral-light' />}
              <Text tableItemSmall color='text.primary'>
                {token}
              </Text>
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
