import { Text } from '@penumbra-zone/ui/Text';
import { ReactNode } from 'react';
import { Skeleton } from '@/shared/ui/skeleton';
import { RecentExecutionVV, useRecentExecutions } from '@/pages/trade/api/recent-executions.ts';
import { Density } from '@penumbra-zone/ui/Density';

export const Cell = ({ children }: { children: ReactNode }) => {
  return <div className='flex items-center py-1.5 px-3 min-h-12'>{children}</div>;
};

export const HeaderCell = ({ children }: { children: ReactNode }) => {
  return (
    <Cell>
      <Text detail whitespace='nowrap'>
        {children}
      </Text>
    </Cell>
  );
};

export const LoadingCell = () => {
  return (
    <Cell>
      <div className='w-12 h-4'>
        <Skeleton />
      </div>
    </Cell>
  );
};

const LoadingRow = () => {
  return (
    <div className='grid grid-cols-subgrid col-span-4 text-text-secondary border-b border-other-tonalStroke'>
      <LoadingCell />
      <LoadingCell />
      <LoadingCell />
      <LoadingCell />
    </div>
  );
};

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

const LoadedState = ({ data }: { data: RecentExecutionVV[] }) => {
  return data.map((e, i) => {
    return (
      <div
        key={i}
        className='grid grid-cols-subgrid col-span-4 text-text-secondary border-b border-other-tonalStroke'
      >
        <Cell>
          <Text small color={e.kind === 'buy' ? 'success.light' : 'destructive.light'}>
            {e.price}
          </Text>
        </Cell>
        <Cell>
          <Text small color='text.primary'>
            {e.amount}
          </Text>
        </Cell>
        <Cell>
          <Text small color='text.primary'>
            {formatLocalTime(e.timestamp)}
          </Text>
        </Cell>
        <Cell>-</Cell>
      </div>
    );
  });
};

export const MarketTrades = () => {
  const { data, isLoading, error } = useRecentExecutions();

  return (
    <Density slim>
      <div className='grid grid-cols-4 pt-4 px-4 pb-0 h-auto overflow-auto'>
        <div className='grid grid-cols-subgrid col-span-4 text-text-secondary border-b border-other-tonalStroke'>
          <HeaderCell>Price</HeaderCell>
          <HeaderCell>Amount</HeaderCell>
          <HeaderCell>Time</HeaderCell>
          <HeaderCell>Route</HeaderCell>
        </div>

        {isLoading && new Array(15).fill(0).map((_, i) => <LoadingRow key={i} />)}
        {error && <ErrorState error={error} />}
        {data && <LoadedState data={data} />}
      </div>
    </Density>
  );
};
