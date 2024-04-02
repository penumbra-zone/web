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
}: {
  label: string;
  secondaryText?: string;
  value: T;
  onSelect: (value: T) => void;
  isSelected: boolean;
}) => (
  <div
    className={cn(
      'bg-charcoal border-[1px] border-solid border-border rounded-[6px] p-4 flex cursor-pointer flex-col gap-1 transition-colors',
      isSelected && 'border-teal',
    )}
    role='button'
    onClick={() => onSelect(value)}
  >
    <span>{label}</span>

    {!!secondaryText && <span className='text-xs text-muted-foreground'>{secondaryText}</span>}
  </div>
);

SelectList.Option = Option;
