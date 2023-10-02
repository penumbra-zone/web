'use client';

import React, { useEffect, useState } from 'react';
import { InputBlock, InputToken, ResponsiveImage } from '../../shared';
import { Button, Switch } from 'ui';
import { assets } from './constants';
import { Asset } from '../../types/asset';
import { SendValidationErrors } from './types';

export const SendForm = () => {
  const [asset, setAsset] = useState<Asset>(assets[0]!);
  const [recepient, setRecepient] = useState('');
  const [memo, setMemo] = useState('');
  const [amount, setAmount] = useState('');
  const [hidden, setHidden] = useState(false);
  const [validationErrors, setValidationErrors] = useState<SendValidationErrors>({
    recepient: false,
    amount: false,
  });

  useEffect(() => {
    setValidationErrors(state => ({
      ...state,
      amount: validateAmount(amount),
    }));
  }, [asset]);

  const validateAmount = (value: string) => Boolean(value) && Number(value) > asset.balance;

  const validateRecepient = (value: string) =>
    Boolean(value) && (value.length !== 146 || !value.startsWith('penumbrav2t'));

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
        onChange={e => {
          setValidationErrors(state => ({
            ...state,
            recepient: validateRecepient(e.target.value),
          }));
          setRecepient(e.target.value);
        }}
        validations={[
          {
            type: 'error',
            error: 'bad format',
            checkFn: (txt: string) => validateRecepient(txt),
          },
        ]}
      />
      <InputToken
        label='Amount to send'
        placeholder='Enter an amount'
        className='mb-1'
        asset={asset}
        setAsset={setAsset}
        value={amount}
        onChange={e => {
          if (Number(e.target.value) < 0) return;
          setValidationErrors(state => ({
            ...state,
            amount: validateAmount(e.target.value),
          }));
          setAmount(e.target.value);
        }}
        validations={[
          {
            type: 'error',
            error: 'insufficient funds',
            checkFn: (txt: string) => validateAmount(txt),
          },
        ]}
      />
      <InputBlock
        label='Memo'
        placeholder='Optional message'
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
      <Button
        type='submit'
        variant='gradient'
        className='mt-4'
        disabled={!amount || !recepient || !!Object.values(validationErrors).find(Boolean)}
      >
        Send
      </Button>
    </form>
  );
};
