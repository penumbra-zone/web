import { Dispatch, useState } from 'react';
import { Input } from '@penumbra-zone/ui/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from '@penumbra-zone/ui/components/ui/dialog';
import { WalletRepo } from '@cosmos-kit/core';
import { Button } from '@penumbra-zone/ui/components/ui/button';

export interface SelectCosmosWalletModalProps {
  isOpen: boolean;
  setOpen: Dispatch<boolean>;
  walletRepo?: WalletRepo;
}

export default function SelectCosmosWalletModal({
  isOpen,
  setOpen,
  walletRepo,
}: SelectCosmosWalletModalProps) {
  const [search, setSearch] = useState('');

  console.log('cosmos wallet modal isOpen', isOpen);
  return (
    <Dialog>
      <DialogTrigger disabled={!walletRepo?.wallets.length}>
        <div className='flex h-9 min-w-[100px] max-w-[200px] items-center justify-center gap-2 rounded-lg bg-light-brown px-2'>
          <Button onClick={() => setOpen(true)}>Select Wallet</Button>
        </div>
      </DialogTrigger>
      <DialogContent>
        <div className='relative z-10 flex max-h-screen flex-col gap-4 pb-5'>
          <DialogHeader>Select asset</DialogHeader>
          <div className='px-[30px]'>
            <div className='relative flex w-full items-center justify-center gap-4'>
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
            {/*
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
            */}
          </div>
        </div>
        <div className='absolute inset-0 z-0 bg-card-radial opacity-20' />
      </DialogContent>
    </Dialog>
  );
}
