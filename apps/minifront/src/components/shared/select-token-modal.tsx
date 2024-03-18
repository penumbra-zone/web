import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { useState } from 'react';
import { Input } from '@penumbra-zone/ui/components/ui/input';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from '@penumbra-zone/ui/components/ui/dialog';
import { cn } from '@penumbra-zone/ui/lib/utils';
import { ValueViewComponent } from '@penumbra-zone/ui/components/ui/tx/view/value';
import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { getAddressIndex } from '@penumbra-zone/getters/src/address-view';

interface SelectTokenModalProps {
  selection: BalancesResponse | undefined;
  setSelection: (selection: BalancesResponse) => void;
  balances: BalancesResponse[];
}

export default function SelectTokenModal({
  selection,
  balances,
  setSelection,
}: SelectTokenModalProps) {
  const [search, setSearch] = useState('');

  return (
    <Dialog>
      <DialogTrigger disabled={!balances.length}>
        <div className='flex h-9 min-w-[100px] max-w-[200px] items-center justify-center gap-2 rounded-lg bg-light-brown px-2'>
          <ValueViewComponent
            view={selection?.balanceView}
            showValue={false}
            showEquivalent={false}
          />
        </div>
      </DialogTrigger>
      <DialogContent>
        <div className='relative z-10 flex max-h-screen flex-col gap-4 pb-5'>
          <DialogHeader>Select asset</DialogHeader>
          <div className='px-[30px]'>
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
          </div>
          <div className='flex shrink flex-col gap-4 overflow-auto px-[30px]'>
            <div className='mt-2 grid grid-cols-4 font-headline text-base font-semibold'>
              <p className='flex justify-start'>Account</p>
              <p className='col-span-3 flex justify-start'>Asset</p>
            </div>
            <div className='flex flex-col gap-2'>
              {balances.map((b, i) => {
                const index = getAddressIndex(b.accountAddress).account;

                return (
                  <div key={i} className='flex flex-col'>
                    <DialogClose>
                      <div
                        className={cn(
                          'grid grid-cols-4 py-[10px] cursor-pointer hover:bg-light-brown hover:px-4 hover:-mx-4 font-bold text-muted-foreground',
                          selection?.balanceView?.equals(b.balanceView) &&
                            selection.accountAddress?.equals(b.accountAddress) &&
                            'bg-light-brown px-4 -mx-4',
                        )}
                        onClick={() => setSelection(b)}
                      >
                        <p className='flex justify-start'>{index}</p>
                        <div className='col-span-3 flex justify-start'>
                          <ValueViewComponent view={b.balanceView} />
                        </div>
                      </div>
                    </DialogClose>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className='absolute inset-0 z-0 bg-card-radial opacity-20' />
      </DialogContent>
    </Dialog>
  );
}
