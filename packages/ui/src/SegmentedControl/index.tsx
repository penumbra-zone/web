import cn from 'clsx';
import { ElementType, ReactNode } from 'react';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { Density, useDensity } from '../utils/density';
import { buttonMedium, button } from '../utils/typography';

export interface SegmentedControlItemProps {
  /** A string that is prompted into SegmentedControl's `onChange` when an Item is pressed */
  value: string;
  /** Visual identity, gives a color to a selected Item */
  style?: 'red' | 'green' | 'filled' | 'unfilled';
  as?: ElementType;
  disabled?: boolean;
  children?: ReactNode;
}

export interface SegmentedControlProps {
  /** A value that selects one of the items within SegmentedControl */
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  as?: ElementType;
}

const getItemClassesByDensity = (density: Density): string => {
  if (density === 'sparse') {
    return cn('h-8 px-4 py-1', button);
  }
  return cn('h-6 px-2', buttonMedium);
};

const getItemClassesByStyle = (style: SegmentedControlItemProps['style']): string => {
  if (style === 'red') {
    return cn(
      'aria-checked:border-transparent aria-checked:bg-destructive-main aria-checked:focus:outline-action-destructive-focus-outline',
    );
  }
  if (style === 'green') {
    return cn(
      'aria-checked:border-transparent aria-checked:bg-success-main aria-checked:focus:outline-action-success-focus-outline',
    );
  }
  if (style === 'filled') {
    return cn('aria-checked:border-transparent aria-checked:bg-neutral-main');
  }
  return cn('aria-checked:border-neutral-light');
};

export const SegmentedControlItem = ({
  as: Container = 'button',
  value,
  style,
  disabled,
  children,
}: SegmentedControlItemProps) => {
  const density = useDensity();

  return (
    <ToggleGroup.Item
      value={value}
      asChild
      disabled={disabled}
      className={cn(
        'relative flex items-center justify-center overflow-hidden',
        'text-text-secondary aria-checked:text-text-primary',
        'border border-other-tonal-stroke bg-transparent',
        'transition-colors',
        getItemClassesByDensity(density),
        getItemClassesByStyle(style),
        // Hover style
        'after:pointer-events-none after:absolute after:inset-0 after:bg-transparent after:transition-colors after:content-[""] not-disabled:hover:border-neutral-light not-disabled:hover:after:bg-action-hover-overlay',
        // Focus style
        'outline-2 outline-transparent outline-solid focus:outline-action-neutral-focus-outline',
        // Disabled style
        'before:pointer-events-none before:absolute before:inset-0 before:bg-transparent before:transition-colors before:content-[""] disabled:cursor-not-allowed disabled:before:bg-action-disabled-overlay',
        // Correctly round and hide borders based on the item position
        'first:rounded-l-full last:rounded-r-full only:rounded-full',
        'not-last:border-r-0 [&[aria-checked="true"]:not(:last-child)]:border-r [&[aria-checked="true"]:not(:last-child)+*]:border-l-0',
        '[&:hover:not(:last-child)]:border-r [&:hover:not(:last-child)+*]:border-l-0',
      )}
    >
      <Container>{children ?? value}</Container>
    </ToggleGroup.Item>
  );
};

/**
 * SegmentedControl is a single-choice selector, consisting of multiple button-looking checkboxes.
 * Use it to fit a list of options in a small space.
 *
 * Example:
 *
 * ```tsx
 * const Component = () => {
 *   const [value, setValue] = useState('one');
 *
 *   return (
 *     <SegmentedControl value={value} onChange={setValue}>
 *       <SegmentedControl.Item value='one' style='unfilled' disabled />
 *       <SegmentedControl.Item value='two' style='filled' />
 *       <SegmentedControl.Item value='three' style='red' />
 *       <SegmentedControl.Item value='four' style='green' />
 *     </SegmentedControl>
 *   );
 * },
 * ```
 */
export const SegmentedControl = ({
  children,
  as: Container = 'div',
  value,
  onChange,
}: SegmentedControlProps) => {
  return (
    <ToggleGroup.Root
      type='single'
      asChild
      value={value}
      onValueChange={onChange}
      className={cn('flex items-center')}
    >
      <Container>{children}</Container>
    </ToggleGroup.Root>
  );
};
SegmentedControl.Item = SegmentedControlItem;
