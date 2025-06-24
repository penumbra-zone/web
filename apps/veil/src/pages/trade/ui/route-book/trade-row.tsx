import { Fragment } from 'react';
import cn from 'clsx';
import { ChevronRight } from 'lucide-react';
import { getSymbolFromValueView } from '@penumbra-zone/getters/value-view';
import { Text } from '@penumbra-zone/ui/Text';
import { Trace } from '@/shared/api/server/book/types.ts';
import { pluralize } from '@/shared/utils/pluralize';
import { pnum } from '@penumbra-zone/types/pnum';

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
        'relative col-span-4 grid h-full grid-cols-subgrid items-center border-b border-other-tonal-fill15 px-4',
        'after:absolute after:right-0 after:left-0 after:hidden after:h-full after:bg-other-tonal-fill5 after:content-[""]',
        'group hover:after:block [&:hover>span:not(:last-child)]:invisible',
        'text-xs tabular-nums', // makes all numbers monospaced
      )}
    >
      <Text detailTechnical color={isSell ? 'destructive.light' : 'success.light'}>
        {pnum(trace.price).toFormattedString({
          commas: false,
          decimals: 7,
        })}
      </Text>
      <Text detailTechnical align='right' color='text.primary'>
        {pnum(trace.amount).toFormattedString({
          commas: false,
          decimals: 6,
        })}
      </Text>
      <Text detailTechnical align='right' color='text.primary'>
        {pnum(trace.total).toFormattedString({
          commas: false,
          decimals: 6,
        })}
      </Text>
      <Text
        tableItemSmall
        align='right'
        color={trace.hops.length <= 2 ? 'text.primary' : 'text.special'}
      >
        {trace.hops.length === 2 ? 'Direct' : pluralize(trace.hops.length - 2, 'Hop', 'Hops')}
      </Text>

      {/* Route display that shows on hover */}
      <div
        className='absolute right-0 left-0 z-30 hidden justify-center px-4 select-none group-hover:flex'
        style={{ visibility: 'visible' }}
      >
        <div className='flex items-center gap-1 py-2 text-xs'>
          {tokens.map((token, index) => (
            <Fragment key={index}>
              {index > 0 && <ChevronRight className='h-3 w-3 text-neutral-light' />}
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
