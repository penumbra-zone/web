'use client';

import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import Image from 'next/image';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTrigger, Input } from 'ui';
import { cn } from 'ui/lib/utils';

interface InputTokenProps {
  label: string;
  placeholder: string;
  className?: string;
}

export const InputToken = ({ label, placeholder, className }: InputTokenProps) => {
  const [search, setSearch] = useState('');

  return (
    <div
      className={cn(
        'bg-background px-4 pt-3 pb-5 rounded-lg border flex flex-col gap-1',
        className,
      )}
    >
      <div className='flex justify-between items-center'>
        <p className='text-base font-bold'>{label}</p>
        <div className='flex items-start gap-1'>
          <div className='w-5 h-5'>
            <Image src='/wallet.svg' alt='wallet' width={20} height={20} />
          </div>
          <p className='font-bold text-muted-foreground'>42.1</p>
        </div>
      </div>
      <div className='flex justify-between items-center gap-4'>
        <Input variant='transparent' placeholder={placeholder} />
        <Dialog>
          <DialogTrigger asChild>
            <div className='flex items-center gap-2 bg-light-brown px-6 py-[6px] rounded-lg'>
              <div className='w-6 h-6'>
                <Image src='/test-asset-icon.svg' alt='wallet' width={24} height={24} />
              </div>
              <p className='text-base font-bold text-light-grey'>ETH</p>
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
                  {[1, 2, 3].map(i => (
                    <div key={i} className='flex justify-between items-center py-[10px] px-4'>
                      <div className='flex items-start gap-[6px]'>
                        <div className='w-5 h-5'>
                          <Image src='/test-asset-icon.svg' alt='wallet' width={20} height={20} />
                        </div>
                        <p className='font-bold text-muted-foreground'>ETH</p>
                      </div>
                      <p className='font-bold text-muted-foreground'>234.00</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className='absolute inset-0 z-0 bg-card-radial opacity-20' />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
