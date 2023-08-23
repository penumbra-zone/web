import React from 'react';

interface PopupLayoutProps {
  children: React.ReactNode;
}

export const PopupLayout = ({ children }: PopupLayoutProps) => {
  return (
    <div className='relative bg-charcoal'>
      <div className='relative z-10'>{children}</div>
      <div className='absolute inset-0 z-0 rounded-2xl bg-card-radial p-6 opacity-20' />
    </div>
  );
};
