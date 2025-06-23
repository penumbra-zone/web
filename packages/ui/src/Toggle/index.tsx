import cn from 'clsx';
import * as RadixToggle from '@radix-ui/react-toggle';
import { useDisabled } from '../utils/disabled-context';
import { useDensity } from '../utils/density';

export interface ToggleProps {
  /** An accessibility label. */
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  /** @todo: Implement disabled state visually. */
  disabled?: boolean;
}

export const Toggle = ({ label, value, onChange, disabled }: ToggleProps) => {
  const density = useDensity();

  return (
    <RadixToggle.Root
      aria-label={label}
      pressed={value}
      onPressedChange={onChange}
      disabled={useDisabled(disabled)}
      className={cn(
        'border border-solid border-other-tonal-stroke rounded-full transition-colors cursor-pointer',
        value ? 'bg-primary-main' : 'bg-base-transparent',
        density === 'sparse' ? 'w-12' : 'w-8',
      )}
    >
      <div
        className={cn(
          'rounded-full transition-all',
          value ? 'bg-primary-contrast translate-x-[90%]' : 'bg-neutral-light translate-x-0',
          density === 'sparse' ? 'size-6' : 'size-4',
        )}
      />
    </RadixToggle.Root>
  );
};
