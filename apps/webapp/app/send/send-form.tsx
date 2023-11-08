'use client';

import { Button, Switch } from '@penumbra-zone/ui';
import { FilledImage, InputBlock } from '../../shared';
import { useStore } from '../../state';
import { amountToBig, sendSelector, sendValidationErrors } from '../../state/send';
import { useToast } from '@penumbra-zone/ui/components/ui/use-toast';
import { isPenumbraAddr } from '@penumbra-zone/types';
import { useSendBalance } from '../../hooks/send-balance';
import InputToken from '../../shared/input-token';

const Send = () => {
  const { toast } = useToast();
  const {
    amount,
    asset,
    recipient,
    memo,
    hidden,
    setAmount,
    setAsset,
    setRecipient,
    setMemo,
    setHidden,
    sendTx,
    txInProgress,
  } = useStore(sendSelector);

  const assetBalance = useSendBalance();
  const validationErrors = sendValidationErrors(asset, amount, recipient, assetBalance);

  return (
    <form
      className='flex flex-col md:gap-4 xl:gap-3'
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
        value={memo}
        onChange={e => setMemo(e.target.value)}
      />
      <div className='flex items-center justify-between md:-mt-2 xl:mt-1'>
        <div className='flex items-start gap-2'>
          <FilledImage src='/incognito.svg' alt='Incognito' className='h-5 w-5' />
          <p className='font-bold'>Hide Sender from Recipient</p>
        </div>
        <Switch id='sender-mode' checked={hidden} onCheckedChange={checked => setHidden(checked)} />
      </div>
      <Button
        type='submit'
        variant='gradient'
        className='mt-3'
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
