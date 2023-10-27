'use client';

import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogPrimitive,
  DialogTrigger,
  Input,
} from '@penumbra-zone/ui';
import { AssetBalance, useBalancesWithMetadata } from '../hooks/sorted-asset';
import {
  Asset,
  AssetId,
  convertFromBaseUnitAmount,
  uint8ArrayToBase64,
} from '@penumbra-zone/types';
import { cn } from '@penumbra-zone/ui/lib/utils';
import { addAmounts } from '@penumbra-zone/types/src/amount';

interface SelectTokenModalProps {
  asset: Asset;
  setAsset: (asset: AssetId) => void;
}

export default function SelectTokenModal({ asset, setAsset }: SelectTokenModalProps) {
  const [search, setSearch] = useState('');

  const { data: sortedAssets } = useBalancesWithMetadata();

  // Accumulates totals per denom across accounts
  const combineAssetTotals = sortedAssets
    .flatMap(a => a.balances)
    .filter(a => !search || a.denom.display.includes(search.toLowerCase()))
    .reduce<AssetBalance[]>((acc, curr) => {
      const match = acc.find(a => a.denom === curr.denom);
      if (match) {
        match.amount = addAmounts(match.amount, curr.amount);
        match.usdcValue += curr.usdcValue;
      } else {
        acc.push(curr);
      }
      return acc;
    }, []);

  return (
    <Dialog>
      <DialogTrigger disabled={!sortedAssets.length}>
        <div className='flex h-9 w-[100px] items-center justify-center gap-2 rounded-lg bg-light-brown'>
          <p className='text-base font-bold text-light-grey'>{asset.display}</p>
        </div>
      </DialogTrigger>
      <DialogContent className='max-w-[400px] bg-charcoal-secondary'>
        <div className='relative z-10 flex flex-col gap-4 pb-5'>
          <DialogHeader className='border-b'>Select asset</DialogHeader>
          <div className='flex flex-col gap-4 px-[30px]'>
            <div className='relative flex w-full items-center justify-center gap-4'>
              <div className='absolute inset-y-0 left-3 flex items-center'>
                <MagnifyingGlassIcon className='h-5 w-5 text-muted-foreground' />
              </div>
              <Input
                className='pl-10'
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder='Search asset...'
              />
            </div>
            <div className='mt-2 flex items-center justify-between font-headline text-base font-semibold'>
              <p>Token name</p>
              <p>Balance</p>
            </div>
            <div className='flex flex-col gap-2'>
              {combineAssetTotals.map((b, i) => (
                <DialogPrimitive.Close key={i}>
                  <div
                    className={cn(
                      'flex justify-between items-center py-[10px] cursor-pointer hover:bg-light-brown hover:px-4 hover:-mx-4',
                      asset.penumbraAssetId.inner === uint8ArrayToBase64(b.assetId.inner) &&
                        'bg-light-brown px-4 -mx-4',
                    )}
                    onClick={() =>
                      setAsset({
                        inner: uint8ArrayToBase64(b.assetId.inner),
                        altBaseDenom: '',
                        altBech32: '',
                      })
                    }
                  >
                    <div className='flex items-start gap-[6px]'>
                      <p className='font-bold text-muted-foreground'>{b.denom.display}</p>
                    </div>
                    <p className='font-bold text-muted-foreground'>
                      {convertFromBaseUnitAmount(b.amount, b.denom.exponent)}
                    </p>
                  </div>
                </DialogPrimitive.Close>
              ))}
            </div>
          </div>
        </div>
        <div className='absolute inset-0 z-0 bg-card-radial opacity-20' />
      </DialogContent>
    </Dialog>
  );
}
