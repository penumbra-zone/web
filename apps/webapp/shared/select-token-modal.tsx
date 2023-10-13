'use client';

import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { assets } from 'penumbra-constants';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogPrimitive, DialogTrigger, Input } from 'ui';
import { useBalancesWithMetadata } from '../hooks/sorted-asset';
import { formatNumber } from '../utils';
import { FilledImage } from './filled-image';
import { Asset, AssetId } from 'penumbra-types';
import { cn } from 'ui/lib/utils';

interface SelectTokenModalProps {
  asset: Asset;
  setAsset: (asset: AssetId) => void;
}

export default function SelectTokenModal({ asset, setAsset }: SelectTokenModalProps) {
  const [search, setSearch] = useState('');

  const { sortedAssets } = useBalancesWithMetadata('amount', search);

  return (
    <Dialog>
      <DialogTrigger disabled={!assets.length}>
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
              {sortedAssets.map(i => (
                <DialogPrimitive.Close key={i.denomMetadata.display}>
                  <div
                    className={cn(
                      'flex justify-between items-center py-[10px] cursor-pointer hover:bg-light-brown hover:px-2',
                      asset.penumbraAssetId.inner === i.denomMetadata.penumbraAssetId.inner &&
                        'bg-light-brown px-2',
                    )}
                    onClick={() => setAsset(i.denomMetadata.penumbraAssetId)}
                  >
                    <div className='flex items-start gap-[6px]'>
                      {i.denomMetadata.icon && (
                        <FilledImage src={i.denomMetadata.icon} alt='Asset' className='h-5 w-5' />
                      )}
                      <p className='font-bold text-muted-foreground'>{i.denomMetadata.display}</p>
                    </div>
                    <p className='font-bold text-muted-foreground'>
                      {formatNumber(i.balance.amount)}
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
