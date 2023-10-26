'use client';

import { Popover, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover';
import { cn } from '../../lib/utils';

export interface NetworksPopoverProps {
  triggerClassName?: string;
  name: string;
}

const NetworksPopover = ({ triggerClassName, name }: NetworksPopoverProps) => {
  return (
    <Popover open={false}>
      <PopoverTrigger
        className={cn(
          'flex items-center justify-between gap-4 rounded-lg border bg-background px-[18px] h-9 font-bold text-muted-foreground',
          triggerClassName,
        )}
      >
        <p>{name}</p>
      </PopoverTrigger>
      <PopoverContent></PopoverContent>
    </Popover>
  );
};

NetworksPopover.displayName = 'NetworksPopover';

export { NetworksPopover };
