import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@penumbra-zone/ui/components/ui/select';
import { cn } from '@penumbra-zone/ui/lib/utils';
import { useState } from 'react';
import { testnetIbcChains, Chain as PenumbraChain } from '@penumbra-zone/constants/src/chains';

export interface ChainSelectorProps {
  chain?: PenumbraChain;
  setChainId: (selectChain: { chainId: string }) => void;
}

export const ChainSelector = ({ chain, setChainId }: ChainSelectorProps) => {
  const [openSelect, setOpenSelect] = useState(false);

  return (
    <div className='flex flex-col gap-3 rounded-lg border bg-background px-4 pb-5 pt-3'>
      <p className='text-base font-bold'>Chain</p>
      <Select
        value={chain?.chainId}
        onValueChange={v => setChainId({ chainId: v })}
        open={openSelect}
        onOpenChange={setOpenSelect}
      >
        <SelectTrigger open={openSelect}>
          <SelectValue placeholder='Select chain'>
            {chain && (
              <div className='flex gap-2'>
                <img src={chain.iconUrl} alt='Chain' className='size-5' />
                <p className='mt-[2px] text-muted-foreground'>{chain.displayName}</p>
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
                chain?.displayName === i.displayName && 'bg-charcoal-secondary',
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
