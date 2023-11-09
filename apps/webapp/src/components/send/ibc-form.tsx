import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@penumbra-zone/ui';
import { cn } from '@penumbra-zone/ui/lib/utils.ts';
import BigNumber from 'bignumber.js';
import { useState } from 'react';
import { useStore } from '../../state';
import { ibcSelector } from '../../state/ibc.ts';
import { chains } from '@penumbra-zone/constants';
import InputToken from '../shared/input-token.tsx';
import { useLoaderData } from 'react-router-dom';
import { AssetBalance } from '../../fetchers/balances.ts';

export default function IbcForm() {
  const assetBalances = useLoaderData() as AssetBalance[];
  const { amount, asset, chain, setAmount, setAsset, setChain } = useStore(ibcSelector);

  // TODO: Implement assetBalances & validations like send form

  const [openSelect, setOpenSelect] = useState(false);

  return (
    <form
      className='flex flex-col gap-4'
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
        balances={assetBalances}
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
                  <img src={chain.icon} alt='Chain' className='h-5 w-5' />
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
                  <img src={i.icon} alt='Chain' className='h-5 w-5' />
                  <p className='mt-[2px]'>{i.name}</p>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type='submit' variant='gradient' className='md:mt-6 xl:mt-2' disabled={true}>
        Send
      </Button>
    </form>
  );
}
