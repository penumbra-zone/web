'use client';

import * as React from 'react';
import type { DialogProps } from '@radix-ui/react-dialog';
import { Command as CommandPrimitive } from 'cmdk';
import { Search } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Dialog, DialogContent } from '../dialog';

interface CommandProps extends React.ComponentPropsWithoutRef<typeof CommandPrimitive> {
  ref?: React.Ref<React.ElementRef<typeof CommandPrimitive>>;
}

const Command = ({ className, ref, ...props }: CommandProps) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      'flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground',
      className,
    )}
    {...props}
  />
);
Command.displayName = CommandPrimitive.displayName;

type CommandDialogProps = DialogProps;

const CommandDialog = ({ children, ...props }: CommandDialogProps) => {
  return (
    <Dialog {...props}>
      <DialogContent>
        <Command className='[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:size-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:size-5'>
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
};

interface CommandInputProps extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input> {
  ref?: React.Ref<React.ElementRef<typeof CommandPrimitive.Input>>;
}

const CommandInput = ({ className, ref, ...props }: CommandInputProps) => (
  // eslint-disable-next-line react/no-unknown-property -- TODO: justify
  <div className='flex items-center border-b px-3' cmdk-input-wrapper=''>
    <Search className='mr-2 size-4 shrink-0 opacity-50' />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        'flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  </div>
);
CommandInput.displayName = CommandPrimitive.Input.displayName;

interface CommandListProps extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.List> {
  ref?: React.Ref<React.ElementRef<typeof CommandPrimitive.List>>;
}

const CommandList = ({ className, ref, ...props }: CommandListProps) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn('max-h-[300px] overflow-y-auto overflow-x-hidden', className)}
    {...props}
  />
);
CommandList.displayName = CommandPrimitive.List.displayName;

interface CommandEmptyProps extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty> {
  ref?: React.Ref<React.ElementRef<typeof CommandPrimitive.Empty>>;
}

const CommandEmpty = ({ ref, ...props }: CommandEmptyProps) => (
  <CommandPrimitive.Empty ref={ref} className='py-6 text-center text-sm' {...props} />
);
CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

interface CommandGroupProps extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group> {
  ref?: React.Ref<React.ElementRef<typeof CommandPrimitive.Group>>;
}

const CommandGroup = ({ className, ref, ...props }: CommandGroupProps) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      'overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground',
      className,
    )}
    {...props}
  />
);
CommandGroup.displayName = CommandPrimitive.Group.displayName;

interface CommandSeparatorProps
  extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator> {
  ref?: React.Ref<React.ElementRef<typeof CommandPrimitive.Separator>>;
}

const CommandSeparator = ({ className, ref, ...props }: CommandSeparatorProps) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 h-px bg-border', className)}
    {...props}
  />
);
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

interface CommandItemProps extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item> {
  ref?: React.Ref<React.ElementRef<typeof CommandPrimitive.Item>>;
}

const CommandItem = ({ className, ref, ...props }: CommandItemProps) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className,
    )}
    {...props}
  />
);
CommandItem.displayName = CommandPrimitive.Item.displayName;

const CommandShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn('ml-auto text-xs tracking-widest text-muted-foreground', className)}
      {...props}
    />
  );
};
CommandShortcut.displayName = 'CommandShortcut';

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
