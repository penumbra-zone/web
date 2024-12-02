import { Text } from '@penumbra-zone/ui/Text';
import { ReactNode } from 'react';
import { Skeleton } from '@/shared/ui/skeleton';

export const Cell = ({ children }: { children: ReactNode }) => {
  return <div className='flex items-center py-2.5 px-3 min-h-8'>{children}</div>;
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

export const MarketTrades = () => {
  return (
    <div className='grid grid-cols-4 pt-4 px-4 pb-0 h-auto overflow-auto'>
      <div className='grid grid-cols-subgrid col-span-4 text-text-secondary border-b border-other-tonalStroke'>
        <HeaderCell>Price</HeaderCell>
        <HeaderCell>Amount</HeaderCell>
        <HeaderCell>Time</HeaderCell>
        <HeaderCell>Route</HeaderCell>
      </div>

      {new Array(15).fill(0).map((_, i) => (
        <LoadingRow key={i} />
      ))}
    </div>
  );
};
