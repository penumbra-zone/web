'use client';

import dynamic from 'next/dynamic';
import { LoHi, uint8ArrayToBase64 } from 'penumbra-types';
import { useEffect } from 'react';
import { Button, Switch } from 'ui';
import { useBalances } from '../../hooks/balances';
import { FilledImage, InputBlock } from '../../shared';
import { useStore } from '../../state';
import { sendSelector } from '../../state/send';
import { calculateBalance, validateAmount, validateRecipient } from '../../utils';
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
    validationErrors,
    assetBalance,
    setAmount,
    setAsset,
    setRecipient,
    setMemo,
    setHidden,
    setAssetBalance,
  } = useStore(sendSelector);

  const { data, end } = useBalances({ account: 0 });

  useEffect(() => {
    if (!end) return;
    const selectedAsset = data.find(
      i =>
        i.balance?.assetId?.inner &&
        uint8ArrayToBase64(i.balance.assetId.inner) === asset.penumbraAssetId.inner,
    );

    if (!selectedAsset) {
      setAssetBalance(0);
      return;
    }

    const loHi: LoHi = {
      lo: selectedAsset.balance?.amount?.lo ?? 0n,
      hi: selectedAsset.balance?.amount?.hi ?? 0n,
    };

    setAssetBalance(calculateBalance(loHi, asset));
  }, [data, end, asset, setAssetBalance]);

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
        disabled={!amount || !recipient || !!Object.values(validationErrors).find(Boolean)}
      >
        Send
      </Button>
    </form>
  );
}
