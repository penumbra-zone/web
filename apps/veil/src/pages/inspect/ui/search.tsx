'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TextInput } from '@penumbra-zone/ui/TextInput';
import { Icon } from '@penumbra-zone/ui/Icon';
import { Ban, LoaderCircle, Search } from 'lucide-react';
import { isPositionId } from '@penumbra-zone/bech32m/plpid';
import { Button, ButtonProps } from '@penumbra-zone/ui/Button';
import { Density } from '@penumbra-zone/ui/Density';

const isTransactionId = (input: string) => {
  // 64-character hex string
  return /^[a-fA-F0-9]{64}$/.test(input);
};

const isBlockHeight = (input: string) => {
  // test string if it contains only positive numbers
  return /^\d+$/.test(input);
};

const isValidId = (input: string) => {
  return isPositionId(input) || isTransactionId(input) || isBlockHeight(input);
};

const getActionType = (searchQuery: string, isValidId: boolean): ButtonProps['actionType'] => {
  if (!searchQuery) {
    return 'default';
  }
  if (isValidId) {
    return 'accent';
  }
  return 'destructive';
};

export const InspectSearch = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isPositionId(searchQuery)) {
      router.push(`/inspect/lp/${searchQuery}`);
    } else if (isTransactionId(searchQuery)) {
      router.push(`/inspect/tx/${searchQuery}`);
    } else if (isBlockHeight(searchQuery)) {
      router.push(`/inspect/block/${searchQuery}`);
    }
  };

  return (
    <Density compact>
      <div className='flex justify-center mt-4'>
        <div className='max-w-[600px] w-full mx-4 flex gap-2 flex-col'>
          <form onSubmit={handleSearch} className='flex gap-2 items-center'>
            <div className='w-full'>
              <TextInput
                type='text'
                value={searchQuery}
                actionType='accent'
                placeholder='Search by transaction hash, block height and LP position ids'
                onChange={setSearchQuery}
              />
            </div>
            <div className='max-w-[200px]'>
              <Button type='submit' actionType={getActionType(searchQuery, isValidId(searchQuery))}>
                {!!searchQuery && !isValidId(searchQuery) ? (
                  <Icon size='md' IconComponent={Ban} color='base.white' />
                ) : (
                  <Icon size='md' IconComponent={Search} color='base.white' />
                )}
              </Button>
            </div>
          </form>
          {loading && <LoaderCircle className='animate-spin text-white self-center' />}
        </div>
      </div>
    </Density>
  );
};
