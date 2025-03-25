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
      <div ref={parent} className='grid grid-cols-4 pt-4 px-4 pb-0 h-auto overflow-auto'>
        <div className='grid grid-cols-subgrid col-span-4'>
          <TableCell heading>Price</TableCell>
          <TableCell heading>Amount</TableCell>
          <TableCell heading>Time</TableCell>
          <TableCell heading>Route</TableCell>
        </div>

        {error && <ErrorState error={error} />}

        {rows.map((trade, index) => (
          <div
            key={data ? trade.timestamp + trade.amount + trade.kind : index}
            className={cn(
              'relative grid grid-cols-subgrid col-span-4',
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
                'hidden group-hover:flex justify-center items-center gap-1',
                'absolute left-0 right-0 w-full h-full px-4 z-30 select-none border-b border-b-other-tonalStroke',
              )}
            >
              {trade.hops.map((token, index) => (
                <Fragment key={index}>
                  {index > 0 && <ChevronRight className='w-3 h-3 text-neutral-light text-xs' />}
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
