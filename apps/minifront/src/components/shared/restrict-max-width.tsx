import { ReactNode } from 'react';

export const RestrictMaxWidth = ({ children }: { children: ReactNode }) => {
  return <div className='mx-auto w-full max-w-full xl:max-w-[1276px]'>{children}</div>;
};
