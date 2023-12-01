import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { useState } from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  Input,
} from '@penumbra-zone/ui';
import { Asset, AssetId, fromBaseUnitAmount, uint8ArrayToBase64 } from '@penumbra-zone/types';
import { cn } from '@penumbra-zone/ui/lib/utils';
import { AccountBalance } from '../../fetchers/balances.ts';
import { AssetIcon } from './asset-icon.tsx';
import { assets } from '@penumbra-zone/constants';

interface SelectTokenModalProps {
  asset: Asset;
  setAsset: (asset: AssetId) => void;
  balances: AccountBalance[];
}

export default function SelectTokenModal({ asset, setAsset, balances }: SelectTokenModalProps) {
  const [search, setSearch] = useState('');

  return (
    <Dialog>
      <DialogTrigger disabled={!balances.length}>
        <div className='flex h-9 items-center justify-center gap-2 rounded-lg bg-light-brown px-2'>
          <AssetIcon asset={asset} />
          <p className='font-bold text-light-grey md:text-sm xl:text-base'>{asset.display}</p>
        </div>
      </DialogTrigger>
      <DialogContent className='max-w-[312px] bg-charcoal-secondary md:max-w-[400px]'>
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
              <p>Account</p>
              <p>Token name</p>
              <p>Balance</p>
            </div>
            <div className='flex flex-col gap-2'>
              {balances.map(b => (
                <div key={b.index} className='flex flex-col'>
                  {b.balances.map((k, j) => (
                    <DialogClose key={j}>
                      <div
                        className={cn(
                          'grid grid-cols-3 py-[10px] cursor-pointer hover:bg-light-brown hover:px-4 hover:-mx-4 font-bold text-muted-foreground',
                          asset.penumbraAssetId.inner === uint8ArrayToBase64(k.assetId.inner) &&
                            'bg-light-brown px-4 -mx-4',
                        )}
                        onClick={() =>
                          setAsset({
                            inner: uint8ArrayToBase64(k.assetId.inner),
                            altBaseDenom: '',
                            altBech32: '',
                          })
                        }
                      >
                        <p className='flex justify-start'>{b.index}</p>
                        <div className='flex justify-start gap-[6px]'>
                          <AssetIcon
                            asset={
                              assets.find(i => i.display === k.denom.display) ?? {
                                display: '',
                              }
                            }
                          />
                          <p>{k.denom.display}</p>
                        </div>
                        <p>{fromBaseUnitAmount(k.amount, k.denom.exponent).toFormat()}</p>
                      </div>
                    </DialogClose>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className='absolute inset-0 z-0 bg-card-radial opacity-20' />
      </DialogContent>
    </Dialog>
  );
}
