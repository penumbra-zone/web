'use client';

import React from 'react';
import { InputBlock, InputToken, ResponsiveImage } from '../../shared';
import { Button, Switch } from 'ui';

export const SendForm = () => {
  return (
    <form
      className='flex flex-col gap-2'
      onSubmit={e => {
        e.preventDefault();
      }}
    >
      <InputBlock label='Recepient' placeholder='Enter the address' className='mb-1' />
      <InputToken label='Amount to send' placeholder='Enter an amount' className='mb-1' />
      <InputBlock label='Memo' placeholder='Enter the text' />
      <div className='flex items-center justify-between'>
        <div className='flex items-start gap-2'>
          <ResponsiveImage src='/incognito.svg' alt='Incognito' className='h-5 w-5' />
          <p className='font-bold'>Hide Sender from Recipient</p>
        </div>
        <Switch id='sender-mode' />
      </div>
      <Button type='submit' variant='gradient' className='mt-4'>
        Send
      </Button>
    </form>
  );
};
