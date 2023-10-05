'use client';

import { useEffect } from 'react';
import { Button, Switch } from 'ui';
import { FilledImage, InputBlock, InputToken } from '../../shared';
import { useStore } from '../../state';
import { sendSelector } from '../../state/send';
import { validateAmount, validateRecipient } from '../../utils';
import { assets } from './constants';

export const SendForm = () => {
  const {
    amount,
    asset,
    recipient,
    memo,
    hidden,
    validationErrors,
    setAmount,
    setAsset,
    setRecipient,
    setMemo,
    setHidden,
  } = useStore(sendSelector);

  useEffect(() => {
    // assign an asset when the page loads
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
        label='Recipient'
        placeholder='Enter the address'
        className='mb-1'
        value={recipient}
        onChange={e => setRecipient(e.target.value)}
        validations={[
          {
            type: 'error',
            issue: 'invalid address',
            checkFn: (addr: string) => validateRecipient(addr),
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
          setAmount(e.target.value);
        }}
        validations={
          // if the user has no balance, do not confirm the validation
          asset
            ? [
                {
                  type: 'error',
                  issue: 'insufficient funds',
                  checkFn: (amount: string) => validateAmount(amount, asset.balance),
                },
              ]
            : undefined
        }
      />
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
        disabled={
          !amount || !recipient || !asset || !!Object.values(validationErrors).find(Boolean)
        }
      >
        Send
      </Button>
    </form>
  );
};
