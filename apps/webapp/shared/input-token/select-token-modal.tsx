'use client';

import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogPrimitive, DialogTrigger, Input } from 'ui';
import { FilledImage } from '../filled-image';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { assets } from '../../app/send/constants';
import { Asset } from '../../types/asset';
import { formatNumber } from '../../utils';

interface SelectTokenModalProps {
  asset: Asset;
  setAsset: (asset: Asset) => void;
}

export const SelectTokenModal = ({ asset, setAsset }: SelectTokenModalProps) => {
  const [search, setSearch] = useState('');

  const filteredAsset = useMemo(() => {
    const sortedAsset = [...assets].sort((a, b) => {
      // Sort by balance in descending order (largest to smallest).
      if (a.balance !== b.balance) return b.balance - a.balance;
      // If balances are equal, sort by asset name in ascending order
      return a.name.localeCompare(b.name);
    });

    // If no search query is provided, return the sorted assets directly.
    if (!search) return sortedAsset;

    // Filter the sorted assets based on a case-insensitive search query.
    return sortedAsset.filter(asset => asset.name.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className='flex items-center gap-2 bg-light-brown px-6 py-[6px] rounded-lg cursor-pointer'>
          <FilledImage src={asset.icon} alt='Asset' className='w-6 h-6' />
          <p className='text-base font-bold text-light-grey'>{asset.name}</p>
        </div>
      </DialogTrigger>
      <DialogContent className='max-w-[400px] bg-charcoal-secondary'>
        <div className='relative z-10 gap-4 flex flex-col pb-5'>
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
            <div className='flex justify-between items-center font-headline text-base font-semibold mt-2'>
              <p>Token name</p>
              <p>Balance</p>
            </div>
            <div className='flex flex-col gap-2'>
              {filteredAsset.map(asset => (
                <DialogPrimitive.Close key={asset.name}>
                  <div
                    className='flex justify-between items-center py-[10px] cursor-pointer'
                    onClick={() => setAsset(asset)}
                  >
                    <div className='flex items-start gap-[6px]'>
                      <FilledImage src={asset.icon} alt='Asset' className='w-5 h-5' />
                      <p className='font-bold text-muted-foreground'>{asset.name}</p>
                    </div>
                    <p className='font-bold text-muted-foreground'>{formatNumber(asset.balance)}</p>
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
};
