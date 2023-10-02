'use client';

import React, { useState } from 'react';
import { InputBlock, InputToken, ResponsiveImage } from '../../shared';
import { Button, Switch } from 'ui';
import { Asset } from './types';
import { assets } from './constants';

export const SendForm = () => {
  const [asset, setAsset] = useState<Asset>(assets[0]!);
  const [recepient, setRecepient] = useState('');
  const [memo, setMemo] = useState('');
  const [amount, setAmount] = useState('');
  const [hidden, setHidden] = useState(false);

  return (
    <form
      className='flex flex-col gap-2'
      onSubmit={e => {
        e.preventDefault();
      }}
    >
      <InputBlock
        label='Recepient'
        placeholder='Enter the address'
        className='mb-1'
        value={recepient}
        onChange={e => setRecepient(e.target.value)}
      />
      <InputToken
        label='Amount to send'
        placeholder='Enter an amount'
        className='mb-1'
        asset={asset}
        setAsset={setAsset}
        value={amount}
        onChange={e => setAmount(e.target.value)}
      />
      <InputBlock
        label='Memo'
        placeholder='Enter the text'
        value={memo}
        onChange={e => setMemo(e.target.value)}
      />
      <div className='flex items-center justify-between'>
        <div className='flex items-start gap-2'>
          <ResponsiveImage src='/incognito.svg' alt='Incognito' className='h-5 w-5' />
          <p className='font-bold'>Hide Sender from Recipient</p>
        </div>
        <Switch id='sender-mode' checked={hidden} onCheckedChange={checked => setHidden(checked)} />
      </div>
      <Button type='submit' variant='gradient' className='mt-4'>
        Send
      </Button>
    </form>
  );
};
