import { ReactNode } from 'react';
import * as RadixDialog from '@radix-ui/react-dialog';
import { DialogContext } from './Context.tsx';
import { EmptyContent, DialogEmptyContentProps } from './EmptyContent.tsx';
import { Content, DialogContentProps } from './Content.tsx';
import { Trigger, DialogTriggerProps } from './Trigger.tsx';
import { RadioGroup, DialogRadioGroupProps } from './RadioItemGroup.tsx';
import { RadioItem, DialogRadioItemProps } from './RadioItem';

interface ControlledDialogProps {
  /**
   * Whether the dialog is currently open. If left `undefined`, this will be
   * treated as an uncontrolled dialog — that is, it will open and close based
   * on user interactions rather than on state variables.
   */
  isOpen: boolean;
  /**
   * Callback for when the user closes the dialog. Should update the state
   * variable being passed in via `isOpen`. If left `undefined`, users will not
   * be able to close it -- that is, it will only be able to be closed
   * programmatically, and no Close button will be rendered.
   */
  onClose?: VoidFunction;
}

interface UncontrolledDialogProps {
  isOpen?: false | undefined;
  onClose?: undefined;
}

export type DialogProps = {
  children?: ReactNode;
} & (ControlledDialogProps | UncontrolledDialogProps);

/**
 * A dialog box that appears over other content.
 *
 * To render a dialog, compose it using a few components: `<Dialog />`,
 * `<Dialog.Trigger />`, and `<Dialog.Content />`. The latter two must be
 * descendents of `<Dialog />` in the component tree, and siblings to each
 * other. (`<Dialog.Trigger />` is optional, though — more on that in a moment.)
 *
 * ```tsx
 * <Dialog>
 *   <Dialog.Trigger asChild>
 *     <Button>Open the dialog</Button>
 *   </Dialog.Trigger>
 *
 *   <Dialog.Content title="Dialog title">Dialog content here</Dialog.Content>
 * </Dialog>
 * ```
 *
 * Depending on your use case, you may want to use `<Dialog />` either as a
 * controlled component, or as an uncontrolled component.
 *
 * ## Usage as a controlled component
 * Use `<Dialog />` as a controlled component when you want to control its
 * open/closed state yourself (e.g., via a state management solution like
 * Zustand or Redux). You can accomplish this by passing `isOpen` and `onClose`
 * props to the `<Dialog />` component, and omitting `<Dialog.Trigger />`:
 *
 * ```tsx
 * <Button onClick={() => setIsOpen(true)}>Open dialog</Button>
 *
 * <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
 *   <Dialog.Content title="Dialog title">Dialog content here</Dialog.Content>
 * </Dialog>
 * ```
 *
 * Note that, in the example above, the `<Button />` lives outside of the
 * `<Dialog />`, and there is no `<Dialog.Trigger />` component rendered inside
 * the `<Dialog />`.
 *
 * You can also leave `onClose` undefined. In that case, no Close button will be
 * rendered, and closing will have to be done programmatically, rather than by
 * the user. This can be useful for, e.g., a dialog with a loading spinner that
 * the user must wait for:
 *
 * ```tsx
 * <Button onClick={() => setIsOpen(true)}>Open dialog</Button>
 *
 * <Dialog isOpen={isOpen}> setIsOpen(false)}>
 *   <Dialog.Content title="Dialog title">
 *     This dialog can not be closed by the user.
 *   </Dialog.Content>
 * </Dialog>
 * ```
 *
 * ## Usage as an uncontrolled component
 * If you want to render `<Dialog />` as an uncontrolled component, don't pass
 * `isOpen` or `onClose` to `<Dialog />`, and make sure to include a
 * `<Dialog.Trigger />` component inside the `<Dialog />`:

 * ```tsx
 * <Dialog>
 *   <Dialog.Trigger asChild>
 *     <Button>Open the dialog</Button>
 *   </Dialog.Trigger>
 *
 *   <Dialog.Content title="Dialog title">Dialog content here</Dialog.Content>
 * </Dialog>
 * ```
 *
 * ## Animating a dialog out of its trigger
 *
 * You can use the `motion` prop with a layout ID to make a dialog appear to
 * animate out of the trigger button:
 *
 * ```tsx
 * const layoutId = useId();
 *
 * return (
 *   <Dialog>
 *     <Dialog.Trigger asChild>
 *       <Button icon={Info} iconOnly='adornment' motion={{ layoutId }}>
 *         Info
 *       </Button>
 *     </Dialog.Trigger>
 *     <Dialog.Content title='Info' motion={{ layoutId }}>
 *       ...
 *     </Dialog.Content>
 *   </Dialog>
 * );
 * ```
 */
export const Dialog = ({ children, onClose, isOpen }: DialogProps) => {
  const isControlledComponent = isOpen !== undefined;
  const showCloseButton = (isControlledComponent && !!onClose) || !isControlledComponent;

  return (
    <DialogContext.Provider value={{ showCloseButton }}>
      <RadixDialog.Root open={isOpen} onOpenChange={value => onClose && !value && onClose()}>
        {children}
      </RadixDialog.Root>
    </DialogContext.Provider>
  );
};

Dialog.EmptyContent = EmptyContent;
Dialog.Content = Content;
Dialog.Trigger = Trigger;
Dialog.RadioGroup = RadioGroup;
Dialog.RadioItem = RadioItem;

export type {
  DialogTriggerProps,
  DialogEmptyContentProps,
  DialogContentProps,
  DialogRadioGroupProps,
  DialogRadioItemProps,
};
