import dynamic from 'next/dynamic';
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@penumbra-zone/ui';
import { FilledImage } from '../../shared';
import { useStore } from '../../state';
import { ibcSelector } from '../../state/ibc';
import { chains } from './constants';
import { cn } from '@penumbra-zone/ui/lib/utils';
import { useState } from 'react';
import BigNumber from 'bignumber.js';

const InputToken = dynamic(() => import('../../shared/input-token'), {
  ssr: false,
});

export default function IbcForm() {
  const { amount, asset, chain, setAmount, setAsset, setChain } = useStore(ibcSelector);

  // TODO: Implement assetBalances & validations like send form

  const [openSelect, setOpenSelect] = useState(false);

  return (
    <form
      className='flex flex-col gap-2'
      onSubmit={e => {
        e.preventDefault();
      }}
    >
      <InputToken
        label='Amount to send'
        placeholder='Enter an amount'
        className='mb-1'
        asset={{ ...asset, price: 10 }}
        assetBalance={BigNumber(0)}
        setAsset={setAsset}
        value={amount}
        onChange={e => {
          if (Number(e.target.value) < 0) return;
          setAmount(e.target.value);
        }}
        validations={[
          {
            type: 'error',
            issue: 'insufficient funds',
            checkFn: () => false,
          },
        ]}
      />
      <div className='flex flex-col gap-3 rounded-lg border bg-background px-4 pb-5 pt-3'>
        <p className='text-base font-bold'>Chain</p>
        <Select
          value={chain?.name ?? ''}
          onValueChange={e => setChain(chains.find(i => i.name === e))}
          open={openSelect}
          onOpenChange={open => setOpenSelect(open)}
        >
          <SelectTrigger open={openSelect}>
            <SelectValue placeholder='Select chain'>
              {chain && (
                <div className='flex gap-2'>
                  <FilledImage src={chain.icon} alt='Chain' className='h-5 w-5' />
                  <p className='mt-[2px] text-muted-foreground'>{chain.name}</p>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className='left-[-17px]'>
            {chains.map((i, index) => (
              <SelectItem
                key={index}
                value={i.name}
                className={cn('hover:bg-brown', chain?.name === i.name && 'bg-charcoal-secondary')}
              >
                <div className='flex gap-2'>
                  <FilledImage src={i.icon} alt='Chain' className='h-5 w-5' />
                  <p className='mt-[2px]'>{i.name}</p>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type='submit' variant='gradient' className='mt-9' disabled={true}>
        Send
      </Button>
    </form>
  );
}
