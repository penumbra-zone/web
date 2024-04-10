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

export const ChainSelector = () => {
  const [open, onOpenChange] = useState(false);
  const { penumbraChain, setChainById } = useStore(ibcSelector);

  return (
    <div className='flex flex-col gap-3 rounded-lg border bg-background px-4 pb-5 pt-3'>
      <p className='text-base font-bold'>Chain</p>
      <Select
        value={penumbraChain?.chainId}
        onValueChange={v => setChainById(v)}
        open={open}
        onOpenChange={onOpenChange}
      >
        <SelectTrigger open={open}>
          <SelectValue placeholder='Select chain'>
            {penumbraChain && (
              <div className='flex gap-2'>
                <img src={penumbraChain.iconUrl} alt='Chain' className='size-5' />
                <p className='mt-[2px] text-muted-foreground'>{penumbraChain.displayName}</p>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className='left-[-17px]'>
          {testnetIbcChains.map((i, index) => (
            <SelectItem
              key={index}
              value={i.chainId}
              className={cn(
                'hover:bg-brown',
                penumbraChain?.displayName === i.displayName && 'bg-charcoal-secondary',
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
