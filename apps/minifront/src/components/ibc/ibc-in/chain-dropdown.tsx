import * as React from 'react';
import { useMemo } from 'react';
import { useManager } from '@cosmos-kit/react';
import { Popover, PopoverContent, PopoverTrigger } from '@penumbra-zone/ui/components/ui/popover';
import { ChevronsUpDown } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@penumbra-zone/ui/components/ui/command';
import { Button } from '@penumbra-zone/ui/components/ui/button';
import { ibcInSelector } from '../../../state/ibc-in';
import { useStore } from '../../../state';
import { Avatar, AvatarImage } from '@penumbra-zone/ui/components/ui/avatar';
import { Identicon } from '@penumbra-zone/ui/components/ui/identicon';

export interface ChainInfo {
  chainName: string;
  chainId: string;
  label: string;
  icon?: string;
}

const useChainInfos = (): ChainInfo[] => {
  const { chainRecords, getChainLogo } = useManager();
  return useMemo(
    () =>
      chainRecords.map(r => {
        return {
          chainName: r.name,
          label: r.chain?.pretty_name ?? '',
          icon: getChainLogo(r.name),
          chainId: r.chain!.chain_id, // TODO: double check this
        };
      }),
    [chainRecords, getChainLogo],
  );
};

// Note the console will display aria-label warnings (despite them being present).
// The cosmology team has been notified of the issue.
export const ChainDropdown = () => {
  const chainInfos = useChainInfos();
  const { setSelectedChain } = useStore(ibcInSelector);

  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState('');

  const selected = chainInfos.find(c => c.chainName === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant='onLight' role='combobox' aria-expanded={open} className='w-[300px]'>
          {value ? (
            <div className='flex gap-2'>
              <Avatar className='size-6'>
                <AvatarImage src={selected?.icon} />
                <Identicon uniqueIdentifier={selected?.label ?? ''} type='gradient' size={22} />
              </Avatar>
              <span className='mt-0.5'>{selected?.label}</span>
            </div>
          ) : (
            'Shield assets from'
          )}
          <ChevronsUpDown className='ml-2 size-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[300px] p-0'>
        <Command>
          <CommandInput placeholder='Search chains...' />
          <CommandEmpty>No framework found.</CommandEmpty>
          <CommandGroup>
            {chainInfos.map(chain => (
              <CommandItem
                key={chain.chainName}
                value={chain.chainName}
                onSelect={currentValue => {
                  setOpen(false);

                  if (currentValue === value) {
                    setValue('');
                    setSelectedChain(undefined);
                  } else {
                    setValue(currentValue);
                    const match = chainInfos.find(options => options.chainName === currentValue);
                    setSelectedChain(match);
                  }
                }}
                className='flex gap-2'
              >
                <Avatar className='size-6'>
                  <AvatarImage src={chain.icon} />
                  <Identicon uniqueIdentifier={chain.label} type='gradient' size={22} />
                </Avatar>
                {chain.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
