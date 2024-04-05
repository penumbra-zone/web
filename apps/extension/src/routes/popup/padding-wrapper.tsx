import { ReactNode } from 'react';

/**
 * Wrap this around any top-level components that should have horizontal and
 * bottom padding in the extension popup.
 */
export const PaddingWrapper = ({ children }: { children: ReactNode }) => {
  return <div className='px-[30px] pb-[30px]'>{children}</div>;
};
