import cn from 'clsx';
import { Fragment } from 'react';
import { ChevronRight } from 'lucide-react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { TableCell } from '@penumbra-zone/ui/TableCell';
import { Density } from '@penumbra-zone/ui/Density';
import { Text } from '@penumbra-zone/ui/Text';
import { pluralize } from '@/shared/utils/pluralize';
import type { RecentExecution } from '@/shared/api/server/recent-executions';
import { EmptyTrades } from './empty';

const ErrorState = ({ error }: { error: Error }) => {
  return <div className='text-red-500'>{String(error)}</div>;
};

const formatLocalTime = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

export interface TradesTableProps {
  error: Error | null;
  data?: RecentExecution[];
  isLoading: boolean;
}

export const TradesTable = ({ error, data, isLoading }: TradesTableProps) => {
  const [parent] = useAutoAnimate();

  const rows = data ?? (new Array(10).fill({ hops: [] }) as RecentExecution[]);

  if (!isLoading && !data?.length) {
    return <EmptyTrades />;
  }

  return (
    <Density slim>
      <div ref={parent} className='grid h-auto grid-cols-4 overflow-auto px-4 pt-4 pb-0'>
        <div className='col-span-4 grid grid-cols-subgrid'>
          <TableCell heading>Price</TableCell>
          <TableCell heading>Amount</TableCell>
          <TableCell heading>Time</TableCell>
          <TableCell heading>Route</TableCell>
        </div>

        {error && <ErrorState error={error} />}

        {rows.map((trade, index) => (
          <div
            key={`${trade.timestamp}-${trade.amount}-${trade.kind}-${index}`}
            className={cn(
              'relative col-span-4 grid grid-cols-subgrid',
              'group [&:hover>div:not(:last-child)]:invisible',
            )}
          >
            <TableCell
              numeric
              variant={index !== rows.length - 1 ? 'cell' : 'lastCell'}
              loading={isLoading}
            >
              <span
                className={trade.kind === 'buy' ? 'text-success-light' : 'text-destructive-light'}
              >
                {trade.price}
              </span>
            </TableCell>
            <TableCell
              variant={index !== rows.length - 1 ? 'cell' : 'lastCell'}
              numeric
              loading={isLoading}
            >
              {trade.amount}
            </TableCell>
            <TableCell
              variant={index !== rows.length - 1 ? 'cell' : 'lastCell'}
              numeric
              loading={isLoading}
            >
              {formatLocalTime(trade.timestamp)}
            </TableCell>
            <TableCell
              variant={index !== rows.length - 1 ? 'cell' : 'lastCell'}
              loading={isLoading}
            >
              <Text
                as='span'
                color={trade.hops.length <= 2 ? 'text.primary' : 'text.special'}
                whitespace='nowrap'
                detailTechnical
              >
                {trade.hops.length === 2
                  ? 'Direct'
                  : pluralize(trade.hops.length - 2, 'Hop', 'Hops')}
              </Text>
            </TableCell>

            {/* Route display that shows on hover */}
            <div
              className={cn(
                'hidden items-center justify-center gap-1 group-hover:flex',
                'absolute right-0 left-0 z-30 h-full w-full border-b border-b-other-tonal-stroke px-4 select-none',
              )}
            >
              {trade.hops.map((token, index) => (
                <Fragment key={index}>
                  {index > 0 && <ChevronRight className='h-3 w-3 text-xs text-neutral-light' />}
                  <Text tableItemSmall color='text.primary'>
                    {token}
                  </Text>
                </Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Density>
  );
};
