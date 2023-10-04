import React from 'react';
import { FilledImage } from '../../shared';

export const NftsTable = () => {
  return (
    <div className='flex h-[404px] flex-col items-center justify-center gap-[18px]'>
      <FilledImage src='/sandpiper-gradient.svg' alt='Sandpiper' className='h-20 w-20' />
      <p>In the process of realization</p>
    </div>
  );
};
