import { ReactNode } from 'react';
import * as RadixPopover from '@radix-ui/react-popover';
import type { PopoverContentProps as RadixPopoverContentProps } from '@radix-ui/react-popover';
import { getPopoverContent, PopoverContext } from '../utils/popover.ts';

interface ControlledPopoverProps {
  /**
   * Whether the popover is currently open. If left `undefined`, this will be
   * treated as an uncontrolled popover — that is, it will open and close based
   * on user interactions rather than on state variables.
   */
  isOpen: boolean;
  /**
   * Callback for when the user closes the popover. Should update the state
   * variable being passed in via `isOpen`. If left `undefined`, users will not
   * be able to close it -- that is, it will only be able to be closed programmatically
   */
  onClose?: VoidFunction;
}

interface UncontrolledPopoverProps {
  isOpen?: undefined;
  onClose?: undefined;
}

export type PopoverProps = {
  children?: ReactNode;
} & (ControlledPopoverProps | UncontrolledPopoverProps);

/**
 * A popover box that appears next to the trigger element.
 *
 * To render a popover, compose it using a few components: `<Popover />`,
 * `<Popover.Trigger />`, and `<Popover.Content />`. The latter two must be
 * descendents of `<Popover />` in the component tree, and siblings to each
 * other. (`<Popover.Trigger />` is optional, though — more on that in a moment.)
 *
 * ```tsx
 * <Popover>
 *   <Popover.Trigger>
 *     <Button>Open the popover</Button>
 *   </Popover.Trigger>
 *
 *   <Popover.Content title="Popover title">Popover content here</Popover.Content>
 * </Popover>
 * ```
 *
 * Depending on your use case, you may want to use `<Popover />` either as a
 * controlled component, or as an uncontrolled component.
 *
 * ## Usage as a controlled component
 *
 * Use `<Popover />` as a controlled component when you want to control its
 * open/closed state yourself (e.g., via a state management solution like
 * Zustand or Redux). You can accomplish this by passing `isOpen` and `onClose`
 * props to the `<Popover />` component, and omitting `<Popover.Trigger />`:
 *
 * ```tsx
 * <Button onClick={() => setIsOpen(true)}>Open popover</Button>
 *
 * <Popover isOpen={isOpen} onClose={() => setIsOpen(false)}>
 *   <Popover.Content title="Popover title">Popover content here</Popover.Content>
 * </Popover>
 * ```
 *
 * Note that, in the example above, the `<Button />` lives outside of the
 * `<Popover />`, and there is no `<Popover.Trigger />` component rendered inside
 * the `<Popover />`.
 *
 * ## Usage as an uncontrolled component
 *
 * If you want to render `<Popover />` as an uncontrolled component, don't pass
 * `isOpen` or `onClose` to `<Popover />`, and make sure to include a
 * `<Popover.Trigger />` component inside the `<Popover />`:

 * ```tsx
 * <Popover>
 *   <Popover.Trigger>
 *     <Button>Open the popover</Button>
 *   </Popover.Trigger>
 *
 *   <Popover.Content title="Popover title">Popover content here</Popover.Content>
 * </Popover>
 * ```
 */
export const Popover = ({ children, onClose, isOpen }: PopoverProps) => {
  return (
    <RadixPopover.Root open={isOpen} onOpenChange={value => onClose && !value && onClose()}>
      {children}
    </RadixPopover.Root>
  );
};

export interface PopoverTriggerProps {
  children: ReactNode;
}

const Trigger = ({ children }: PopoverTriggerProps) => (
  <RadixPopover.Trigger asChild>{children}</RadixPopover.Trigger>
);
Popover.Trigger = Trigger;

export interface PopoverContentProps {
  children?: ReactNode;
  side?: RadixPopoverContentProps['side'];
  align?: RadixPopoverContentProps['align'];
  context?: PopoverContext;
}

/**
 * Popover content. Must be a child of `<Popover />`.
 *
 * Control the position of the Popover relative to the trigger element by passing
 * `side` and `align` props.
 */
const Content = ({ children, side, align, context = 'default' }: PopoverContentProps) => {
  return (
    <RadixPopover.Portal>
      <RadixPopover.Content sideOffset={4} side={side} align={align} asChild>
        <div className={getPopoverContent(context)}>{children}</div>
      </RadixPopover.Content>
    </RadixPopover.Portal>
  );
};
Popover.Content = Content;

export type { PopoverContext };
