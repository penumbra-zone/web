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
import { cn } from '@penumbra-zone/ui/lib/utils';
import { AssetBalance } from '../../fetchers/balances';
import { AssetIcon } from './asset-icon';
import {
  getDisplayDenomFromView,
  ValueViewComponent,
} from '@penumbra-zone/ui/components/ui/tx/view/value.tsx';

interface SelectTokenModalProps {
  selection: AssetBalance | undefined;
  setSelection: (selection: AssetBalance) => void;
  balances: AssetBalance[];
}

export default function SelectTokenModal({
  selection,
  balances,
  setSelection,
}: SelectTokenModalProps) {
  const [search, setSearch] = useState('');

  const displayDenom = selection && getDisplayDenomFromView(selection.value);
  const denomMetadata =
    selection?.value.valueView.case === 'knownAssetId' && selection.value.valueView.value.metadata;

  return (
    <Dialog>
      <DialogTrigger disabled={!balances.length}>
        <div className='flex h-9 min-w-[100px] items-center justify-center gap-2 rounded-lg bg-light-brown px-2'>
          {denomMetadata && <AssetIcon metadata={denomMetadata} />}
          <p className='font-bold text-light-grey md:text-sm xl:text-base'>{displayDenom}</p>
        </div>
      </DialogTrigger>
      <DialogContent className='max-w-[312px] bg-charcoal-secondary md:max-w-[400px]'>
        <div className='relative z-10 flex flex-col gap-4 pb-5'>
          <DialogHeader className='border-b'>Select asset</DialogHeader>
          <div className='flex flex-col gap-4 px-[30px]'>
            <div className='relative flex w-full items-center justify-center gap-4'>
              <div className='absolute inset-y-0 left-3 flex items-center'>
                <MagnifyingGlassIcon className='size-5 text-muted-foreground' />
              </div>
              <Input
                className='pl-10'
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder='Search asset...'
              />
            </div>
            <div className='mt-2 grid grid-cols-3 font-headline text-base font-semibold'>
              <p className='flex justify-start'>Account</p>
              <p className='flex justify-start'>Token name</p>
              <p className='flex justify-end'>Balance</p>
            </div>
            <div className='flex flex-col gap-2'>
              {balances.map((b, i) => (
                <div key={i} className='flex flex-col'>
                  <DialogClose>
                    <div
                      className={cn(
                        'grid grid-cols-3 py-[10px] cursor-pointer hover:bg-light-brown hover:px-4 hover:-mx-4 font-bold text-muted-foreground',
                        selection?.value.equals(b.value) &&
                          selection.address.equals(b.address) &&
                          'bg-light-brown px-4 -mx-4',
                      )}
                      onClick={() => setSelection(b)}
                    >
                      <p className='flex justify-start'>
                        {b.address.addressView.case === 'decoded' &&
                        b.address.addressView.value.index?.account
                          ? b.address.addressView.value.index.account
                          : '0'}
                      </p>
                      <div className='flex justify-start gap-[6px]'>
                        {b.value.valueView.case === 'knownAssetId' &&
                          b.value.valueView.value.metadata && (
                            <AssetIcon metadata={b.value.valueView.value.metadata} />
                          )}
                        <p>{getDisplayDenomFromView(b.value)}</p>
                      </div>
                      <p className='flex justify-end'>
                        <ValueViewComponent view={b.value} showDenom={false} />
                      </p>
                    </div>
                  </DialogClose>
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
