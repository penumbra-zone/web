import React from 'react';
import { InputBlock, InputToken } from '../../shared';

export const SendForm = () => {
  return (
    <div className='flex flex-col gap-2'>
      <InputBlock label='Recepient' placeholder='Enter the address' className='mb-1' />
      <InputToken label='Amount to send' placeholder='Enter an amount' className='mb-1' />
      <InputBlock label='Memo' placeholder='Enter the text' />
    </div>
  );
};
