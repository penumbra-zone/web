import { ReactNode } from 'react';

export const RestrictMaxWidth = ({ children }: { children: ReactNode }) => {
  return <div className='mx-auto xl:max-w-[1276px]'>{children}</div>;
};
