import { createContext, ReactNode, useContext } from 'react';
import styled, { keyframes } from 'styled-components';
import * as RadixDialog from '@radix-ui/react-dialog';
import { Text } from '../Text';
import { Icon } from '../Icon';
import { X } from 'lucide-react';
import { ButtonGroup, ButtonGroupProps } from '../ButtonGroup';

const gradualBlur = (blur: string) => keyframes`
  from {
    backdrop-filter: blur(0);
  }

  to {
    backdrop-filter: blur(${blur});
  }
`;

const Overlay = styled(RadixDialog.Overlay)`
  animation: ${props => gradualBlur(props.theme.blur.xs)} 0.15s forwards;
  /* animation: name duration timing-function delay iteration-count direction fill-mode; */
  position: fixed;
  inset: 0;
  z-index: ${props => props.theme.zIndex.dialogOverlay};
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  };
`;

const TEN_PERCENT_OPACITY_IN_HEX = '1a';
const ONE_PERCENT_OPACITY_IN_HEX = '03';
const DialogContent = styled(RadixDialog.Content)`
  animation: ${fadeIn} 0.15s forwards;

  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: ${props => props.theme.zIndex.dialogContent};

  width: 472px;
  max-width: 100%;
  box-sizing: border-box;

  background: linear-gradient(
    136deg,
    ${props => props.theme.color.neutral.contrast + TEN_PERCENT_OPACITY_IN_HEX},
    ${props => props.theme.color.neutral.contrast + ONE_PERCENT_OPACITY_IN_HEX}
  );
  border: 1px solid ${props => props.theme.color.other.tonalStroke};
  border-radius: ${props => props.theme.borderRadius.xl};
  backdrop-filter: blur(${props => props.theme.blur.xl});

  padding-top: ${props => props.theme.spacing(8)};
  padding-bottom: ${props => props.theme.spacing(8)};
  padding-left: ${props => props.theme.spacing(6)};
  padding-right: ${props => props.theme.spacing(6)};

  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing(6)};
`;

const TitleAndCloseButton = styled.header`
  display: flex;
  color: ${props => props.theme.color.text.primary};
  justify-content: space-between;
`;

interface ControlledDialogProps {
  isOpen: boolean;
  onClose: VoidFunction;
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
 */
export const Dialog = ({ children, onClose, isOpen }: DialogProps) => (
  <DialogContext.Provider value={{ onClose }}>
    <RadixDialog.Root open={isOpen} onOpenChange={value => onClose && !value && onClose()}>
      {children}
    </RadixDialog.Root>
  </DialogContext.Provider>
);

/**
 * Internal use only. Provides a context that `<Dialog.Content />` can read to
 * determine whether to pass an `onClick` handler to `<RadixDialog.Close />`.
 */
const DialogContext = createContext<{ onClose?: VoidFunction }>({});

const CloseButton = styled.button`
  appearance: none;
  background: none;
  border: none;
  color: ${props => props.theme.color.text.primary};
`;

export interface DialogContentProps<IconOnlyButtonGroupProps extends boolean | undefined> {
  children?: ReactNode;
  title: string;
  /**
   * If you want to render CTA buttons in the dialog footer, use
   * `buttonGroupProps`. The dialog will then render a `<ButtonGroup />` using
   * these props.
   */
  buttonGroupProps?: IconOnlyButtonGroupProps extends boolean
    ? ButtonGroupProps<IconOnlyButtonGroupProps>
    : undefined;
}

const Content = <IconOnlyButtonGroupProps extends boolean | undefined>({
  children,
  title,
  buttonGroupProps,
}: DialogContentProps<IconOnlyButtonGroupProps>) => {
  const { onClose } = useContext(DialogContext);

  return (
    <RadixDialog.Portal>
      <Overlay />

      <DialogContent>
        <TitleAndCloseButton>
          <RadixDialog.Title asChild>
            <Text xxl as='h2'>
              {title}
            </Text>
          </RadixDialog.Title>

          <RadixDialog.Close onClick={onClose} asChild>
            <CloseButton>
              <Icon IconComponent={X} size='md' />
            </CloseButton>
          </RadixDialog.Close>
        </TitleAndCloseButton>

        {children}

        {buttonGroupProps && <ButtonGroup {...buttonGroupProps} column />}
      </DialogContent>
    </RadixDialog.Portal>
  );
};
Dialog.Content = Content;

export interface DialogTriggerProps {
  children: ReactNode;
  /**
   * Change the default rendered element for the one passed as a child, merging
   * their props and behavior.
   *
   * Uses Radix UI's `asChild` prop under the hood.
   *
   * @see https://www.radix-ui.com/primitives/docs/guides/composition
   */
  asChild?: boolean;
}

const Trigger = ({ children, asChild }: DialogTriggerProps) => (
  <RadixDialog.Trigger asChild={asChild}>{children}</RadixDialog.Trigger>
);
Dialog.Trigger = Trigger;
