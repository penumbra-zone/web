import cn from 'clsx';

export type PopoverContext = 'default' | 'success' | 'caution' | 'error';

const getPopoverBackground = (context: PopoverContext): string => {
  if (context === 'success') {
    return cn('bg-secondary-radial-background');
  }
  if (context === 'caution') {
    return cn('bg-caution-radial-background');
  }
  if (context === 'error') {
    return cn('bg-destructive-radial-background');
  }
  return cn('bg-other-dialog-background');
};

export const getPopoverContent = (context: PopoverContext): string =>
  cn(
    'flex flex-col w-[240px] max-w-[320px] p-3',
    'border border-solid border-other-tonal-stroke rounded-sm backdrop-blur-lg',
    'origin-(--radix-popper-transform-origin) animate-scale',
    getPopoverBackground(context),
  );
