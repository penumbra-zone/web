'use client';

import { Popover, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover';
import { cn } from '../../lib/utils';

export interface NetworksPopoverProps {
  triggerClassName?: string;
  name: string;
  connectIndicator?: boolean;
}

const NetworksPopover = ({
  triggerClassName,
  name,
  connectIndicator = true,
}: NetworksPopoverProps) => {
  return (
    <Popover open={false}>
      <PopoverTrigger
        className={cn(
          'flex items-center justify-between gap-4 rounded-lg border bg-background px-5 md:px-[25px] xl:px-[18px] py-[7px] font-bold text-muted-foreground',
          triggerClassName,
        )}
      >
        {connectIndicator && (
          <div className='-mx-1 h-4 w-1 rounded-sm bg-gradient-to-b from-cyan-400 to-emerald-400'></div>
        )}
        <p className='hidden md:block'>{name}</p>
        <p className='block md:hidden'>{name.slice(0,14)}...</p>
      </PopoverTrigger>
      <PopoverContent></PopoverContent>
    </Popover>
  );
};

NetworksPopover.displayName = 'NetworksPopover';

export { NetworksPopover };
