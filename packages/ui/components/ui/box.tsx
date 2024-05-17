import { PropsWithChildren } from 'react';

/**
 * A simple black box with rounded corners.
 */
export const Box = ({ children, label }: PropsWithChildren<{ label?: string }>) => {
  return (
    <div className='rounded-lg border bg-background p-4'>
      {label && <div className='font-bold text-muted-foreground mb-2'>{label}</div>}
      {children}
    </div>
  );
};
