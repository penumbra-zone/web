import cn from 'clsx';

export type PopoverContext = 'default' | 'success' | 'caution' | 'error';

const getPopoverBackground = (context: PopoverContext): string => {
  if (context === 'success') {
    return cn('bg-secondaryRadialBackground');
  }
  if (context === 'caution') {
    return cn('bg-cautionRadialBackground');
  }
  if (context === 'error') {
    return cn('bg-destructiveRadialBackground');
  }
  return cn('bg-other-dialogBackground');
};

export const getPopoverContent = (context: PopoverContext): string =>
  cn(
    'flex flex-col w-[240px] max-w-[320px] p-3',
    'border border-solid border-other-tonalStroke rounded-sm backdrop-blur-lg',
    'origin-[--radix-popper-transform-origin] animate-scale',
    getPopoverBackground(context),
  );
