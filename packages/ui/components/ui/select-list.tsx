import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

/**
 * A select list is a nicely formatted vertical list of options for a user to
 * choose from. It's functionally identical to a series of radio buttons, but
 * presents options as clickable rectangular buttons, rather than circular radio
 * buttons.
 */
export const SelectList = ({ children }: { children: ReactNode }) => (
  <div className='flex flex-col gap-2'>{children}</div>
);

const Option = <T,>({
  label,
  secondaryText,
  value,
  onSelect,
  isSelected,
  image,
}: {
  label: string;
  secondaryText?: ReactNode;
  value: T;
  onSelect: (value: T) => void;
  isSelected: boolean;
  image?: ReactNode;
}) => (
  <div
    className={cn(
      'flex items-center cursor-pointer gap-2 rounded-[6px] border-[1px] border-DEFAULT border-solid border-border bg-charcoal p-4 transition-colors',
      isSelected && 'border-teal',
    )}
    role='button'
    onClick={() => onSelect(value)}
  >
    <div className='flex size-10 shrink-0 items-center justify-center'>{image}</div>

    <div className='flex grow flex-col gap-1'>
      <div>{label}</div>

      {!!secondaryText && <span className='text-xs text-muted-foreground'>{secondaryText}</span>}
    </div>
  </div>
);

SelectList.Option = Option;
