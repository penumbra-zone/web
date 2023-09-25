'use client';
import { CaretDownIcon } from '@radix-ui/react-icons';
import { Popover, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover';
import { cn } from '../../lib/utils';

export interface NetworksPopoverProps {
  triggerClassName?: string;
}

const NetworksPopover = ({ triggerClassName }: NetworksPopoverProps) => {
  return (
    <Popover open={false}>
      <PopoverTrigger
        className={cn(
          'flex items-center justify-between gap-4 rounded-lg border bg-background px-[18px] py-[7px] font-bold text-muted-foreground',
          triggerClassName,
        )}
      >
        <p>penumbra-testnet</p>
        <CaretDownIcon className='h-5 w-5' />
      </PopoverTrigger>
      <PopoverContent></PopoverContent>
    </Popover>
  );
};

NetworksPopover.displayName = 'NetworksPopover';

export { NetworksPopover };
