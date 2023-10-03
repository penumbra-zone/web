'use client';

import { useEffect } from 'react';
import { Button, Switch } from 'ui';
import { FilledImage, InputBlock, InputToken } from '../../shared';
import { useStore } from '../../state';
import { sendSelector } from '../../state/send';
import { assets } from './constants';
import { validateAmount, validateRecepient } from '../../utils';

export const SendForm = () => {
  const {
    amount,
    asset,
    recepient,
    memo,
    hidden,
    validationErrors,
    setAmount,
    setAsset,
    setRecepient,
    setMemo,
    setHidden,
  } = useStore(sendSelector);

  useEffect(() => {
    // Test logic!!!
    setAsset(assets[0]!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        validations={[
          {
            type: 'error',
            error: 'bad format',
            checkFn: (txt: string) => validateRecepient(txt),
          },
        ]}
      />
      {asset && (
        <InputToken
          label='Amount to send'
          placeholder='Enter an amount'
          className='mb-1'
          asset={asset}
          setAsset={setAsset}
          value={amount}
          onChange={e => {
            if (Number(e.target.value) < 0) return;
            setAmount(e.target.value);
          }}
          validations={[
            {
              type: 'error',
              error: 'insufficient funds',
              checkFn: (txt: string) => validateAmount(txt, asset.balance),
            },
          ]}
        />
      )}
      <InputBlock
        label='Memo'
        placeholder='Optional message'
        value={memo}
        onChange={e => setMemo(e.target.value)}
      />
      <div className='flex items-center justify-between'>
        <div className='flex items-start gap-2'>
          <FilledImage src='/incognito.svg' alt='Incognito' className='h-5 w-5' />
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
