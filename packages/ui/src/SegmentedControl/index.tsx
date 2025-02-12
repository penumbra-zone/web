import cn from 'clsx';
import { ElementType, ReactNode } from 'react';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { Density, useDensity } from '../utils/density';
import { buttonMedium, button } from '../utils/typography';

export interface SegmentedControlItemProps {
  value: string;
  style?: 'red' | 'green' | 'filled' | 'unfilled';
  as?: ElementType;
  disabled?: boolean;
  children?: ReactNode;
}

export interface SegmentedControlProps {
  as?: ElementType;
  children: ReactNode;
  onChange: (value: string) => void;
  value: string;
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
      'aria-checked:bg-destructive-main aria-checked:border-transparent aria-checked:focus:outline-action-destructiveFocusOutline',
    );
  }
  if (style === 'green') {
    return cn(
      'aria-checked:bg-success-main aria-checked:border-transparent aria-checked:focus:outline-action-successFocusOutline',
    );
  }
  if (style === 'filled') {
    return cn('aria-checked:bg-neutral-main aria-checked:border-transparent');
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
        'flex items-center justify-center overflow-hidden relative',
        'text-text-secondary aria-checked:text-text-primary',
        'bg-transparent border border-other-tonalStroke',
        'transition-colors',
        getItemClassesByDensity(density),
        getItemClassesByStyle(style),
        // Hover style
        '[&:not(:disabled)]:hover:border-neutral-light after:content-[""] after:absolute after:inset-0 after:bg-transparent after:pointer-events-none [&:not(:disabled)]:hover:after:bg-action-hoverOverlay after:transition-colors',
        // Focus style
        'outline outline-2 outline-transparent focus:outline-action-neutralFocusOutline',
        // Disabled style
        'disabled:cursor-not-allowed before:content-[""] before:absolute before:inset-0 before:bg-transparent before:pointer-events-none disabled:before:bg-action-disabledOverlay before:transition-colors',
        // Correctly round and hide borders based on the item position
        'only:rounded-full first:rounded-l-full last:rounded-r-full',
        '[&:not(:last-child)]:border-r-0 [&[aria-checked="true"]:not(:last-child)]:border-r-[1px] [&[aria-checked="true"]:not(:last-child)+*]:border-l-0',
        '[&:hover:not(:last-child)]:border-r-[1px] [&:hover:not(:last-child)+*]:border-l-0',
      )}
    >
      <Container>{children ?? value}</Container>
    </ToggleGroup.Item>
  );
};

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
