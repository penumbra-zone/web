import { ReactNode } from 'react';
import { Skeleton } from '@penumbra-zone/ui/Skeleton';

export const Cell = ({ children }: { children: ReactNode }) => {
  return <div className='flex items-center py-1.5 px-3 min-h-12'>{children}</div>;
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
