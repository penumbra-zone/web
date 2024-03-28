import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@penumbra-zone/ui/components/ui/select';
import { cn } from '@penumbra-zone/ui/lib/utils';
import { useState } from 'react';
import { testnetIbcChains } from '@penumbra-zone/constants/src/chains';
import { useStore } from '../../state';
import { ibcSelector } from '../../state/ibc';

export const ChainSelector = ({ light }: { light?: boolean }) => {
  const { chain, setChain } = useStore(ibcSelector);
  const [openSelect, setOpenSelect] = useState(false);

  return (
    <div
      className={cn(
        light ? 'bg-teal' : 'bg-background',
        'flex flex-col gap-3 rounded-lg border p-4',
      )}
    >
      <p className={cn('text-base font-bold', light ? 'text-secondary-foreground' : 'text-muted')}>
        Chain
      </p>
      <Select
        value={chain?.displayName ?? ''}
        onValueChange={v => setChain(testnetIbcChains.find(i => i.displayName === v))}
        open={openSelect}
        onOpenChange={open => setOpenSelect(open)}
      >
        <SelectTrigger open={openSelect} className={light ? 'text-secondary' : 'text-muted'}>
          <SelectValue placeholder='Select chain'>
            {chain && (
              <div className='flex gap-2'>
                <img src={chain.iconUrl} alt='Chain' className='size-5' />
                <p className={cn('mt-[2px]', light ? 'text-secondary' : 'text-muted-foreground')}>
                  {chain.displayName}
                </p>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent
          className={cn(
            'left-[-17px]',
            light ? 'bg-teal text-secondary' : 'bg-background text-muted-foreground',
          )}
        >
          {testnetIbcChains.map((i, index) => (
            <SelectItem
              key={index}
              value={i.displayName}
              className={cn(
                chain?.displayName === i.displayName && 'hidden',
                light ? 'hover:bg-teal-600' : 'hover:bg-brown',
              )}
            >
              <div className='flex gap-2'>
                <img src={i.iconUrl} alt='Chain' className='size-5' />
                <p className='mt-[2px]'>{i.displayName}</p>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
