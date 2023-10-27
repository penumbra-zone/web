'use client';

import dynamic from 'next/dynamic';
import { Button, Switch } from '@penumbra-zone/ui';
import { FilledImage, InputBlock } from '../../shared';
import { useStore } from '../../state';
import { sendSelector } from '../../state/send';
import { validateAmount } from '../../utils';
import { useCalculateBalance } from '../../hooks/calculate-balance';
import { useToast } from '@penumbra-zone/ui/components/ui/use-toast';
import { isPenumbraAddr } from '@penumbra-zone/types';

const InputToken = dynamic(() => import('../../shared/input-token'), {
  ssr: false,
});

export default function SendForm() {
  const {
    amount,
    asset,
    recipient,
    memo,
    hidden,
    assetBalance,
    setAmount,
    setAsset,
    setRecipient,
    setMemo,
    setHidden,
    setAssetBalance,
    sendTx,
    txInProgress,
    validationErrors,
  } = useStore(sendSelector);

  useCalculateBalance(asset, setAssetBalance);

  const { toast } = useToast();

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
            checkFn: (addr: string) => Boolean(addr) && !isPenumbraAddr(addr),
          },
        ]}
      />
      <InputToken
        label='Amount to send'
        placeholder='Enter an amount'
        className='mb-1'
        asset={{ ...asset, price: 10 }}
        setAsset={setAsset}
        value={amount}
        onChange={e => {
          if (Number(e.target.value) < 0) return;
          setAmount(e.target.value);
        }}
        assetBalance={assetBalance}
        validations={[
          {
            type: 'error',
            issue: 'insufficient funds',
            checkFn: (amount: string) => validateAmount(amount, assetBalance),
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
          <FilledImage src='/incognito.svg' alt='Incognito' className='h-5 w-5' />
          <p className='font-bold'>Hide Sender from Recipient</p>
        </div>
        <Switch id='sender-mode' checked={hidden} onCheckedChange={checked => setHidden(checked)} />
      </div>
      <Button
        type='submit'
        variant='gradient'
        className='mt-4'
        onClick={() => void sendTx(toast)}
        disabled={
          !Number(amount) ||
          !recipient ||
          !!Object.values(validationErrors).find(Boolean) ||
          txInProgress
        }
      >
        Send
      </Button>
    </form>
  );
}
