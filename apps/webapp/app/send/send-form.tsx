'use client';

import { Button, Switch } from '@penumbra-zone/ui';
import { FilledImage, InputBlock } from '../../shared';
import { useStore } from '../../state';
import { amountToBig, sendSelector, sendValidationErrors } from '../../state/send';
import { useToast } from '@penumbra-zone/ui/components/ui/use-toast';
import { isPenumbraAddr } from '@penumbra-zone/types';
import { useSendBalance } from '../../hooks/send-balance';
import { useAddress, useEphemeralAddress, } from '../../hooks/address';
import { bech32Address } from '@penumbra-zone/types';
import { useMemo, useState } from 'react';
import { cn } from '@penumbra-zone/ui/lib/utils';
import InputToken from '../../shared/input-token';

const Send = () => {
  const { toast } = useToast();
  const {
    amount,
    asset,
    recipient,
    memoText,
    setAmount,
    setAsset,
    setRecipient,
    setMemoText,
    sendTx,
    txInProgress,
  } = useStore(sendSelector);

  const [hidden, setHidden] = useState(false);
  const assetBalance = useSendBalance();
  const validationErrors = sendValidationErrors(asset, amount, recipient, assetBalance);

  // TODO: enable address selection
  const defaultSender = useAddress(0);
  const ephemeralSender = useEphemeralAddress(0, { enabled: hidden })

  const sender = useMemo(() => {
    if (!hidden && defaultSender.data) return bech32Address(defaultSender.data);
    if (hidden && ephemeralSender.data) return bech32Address(ephemeralSender.data);
    return '';
  }, [hidden, defaultSender, ephemeralSender]);

  return (
    <form
      className='flex flex-col gap-2'
      onSubmit={e => {
        e.preventDefault();
      }}
    >
      <InputBlock
        label={hidden ? 'Ephemeral Sender' : 'Sender'}
        placeholder='Loading address...'
        className={cn('mb-1', hidden && 'text-orange-500')}
        value={sender}
        readOnly={true}
      />
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
        assetBalance={amountToBig(asset, assetBalance)}
        validations={[
          {
            type: 'error',
            issue: 'insufficient funds',
            checkFn: () => validationErrors.amountErr,
          },
        ]}
      />
      <InputBlock
        label='Memo'
        placeholder='Optional message'
        value={memoText}
        onChange={e => setMemoText(e.target.value)}
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
};
export default Send;
