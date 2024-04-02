import { ReactNode } from 'react';

/**
 * A statistic that shows up at the top of the staking page.
 */
export const Stat = ({ label, children }: { label: string; children: ReactNode }) => {
  return (
    <div className='flex flex-col items-start justify-center'>
      <span className='text-muted-foreground'>{label}</span>
      {children}
    </div>
  );
};
