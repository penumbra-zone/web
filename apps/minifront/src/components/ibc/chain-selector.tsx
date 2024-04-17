import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@penumbra-zone/ui/components/ui/select';
import { cn } from '@penumbra-zone/ui/lib/utils';
import { useState } from 'react';
import { useStore } from '../../state';
import { ibcSelector } from '../../state/ibc';
import { useLoaderData } from 'react-router-dom';
import { IbcLoaderResponse } from './ibc-loader';
import { Chain } from '@penumbra-labs/registry';

export const ChainSelector = () => {
  const { chain, setChain } = useStore(ibcSelector);
  const { chains: ibcConnections } = useLoaderData() as IbcLoaderResponse;
  const [openSelect, setOpenSelect] = useState(false);

  return (
    <div className='flex flex-col gap-3 rounded-lg border bg-background px-4 pb-5 pt-3'>
      <p className='text-base font-bold'>Chain</p>
      <Select
        value={chain?.displayName ?? ''}
        onValueChange={v => setChain(ibcConnections.find(i => i.displayName === v))}
        open={openSelect}
        onOpenChange={open => setOpenSelect(open)}
      >
        <SelectTrigger open={openSelect}>
          <SelectValue placeholder='Select chain'>
            {chain && (
              <div className='flex gap-2'>
                <ChainIcon chain={chain} />
                <p className='mt-[2px] text-muted-foreground'>{chain.displayName}</p>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className='left-[-17px]'>
          {ibcConnections.map((i, index) => (
            <SelectItem
              key={index}
              value={i.displayName}
              className={cn(
                'hover:bg-brown',
                chain?.displayName === i.displayName && 'bg-charcoal-secondary',
              )}
            >
              <div className='flex gap-2'>
                <ChainIcon chain={i} />
                <p className='mt-[2px]'>{i.displayName}</p>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

const ChainIcon = ({ chain }: { chain: Chain }) => {
  const imgUrl = getChainImgUrl(chain);
  if (!imgUrl) return undefined;

  return <img src={imgUrl} alt='Chain' className='size-5' />;
};

const getChainImgUrl = (chain?: Chain) => {
  const chainImgObj = chain?.images[0];
  if (!chainImgObj) return undefined;

  return chainImgObj.png ?? chainImgObj.svg;
};
