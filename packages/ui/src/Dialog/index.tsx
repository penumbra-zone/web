import { createContext, ReactNode, useContext } from 'react';
import styled from 'styled-components';
import * as RadixDialog from '@radix-ui/react-dialog';
import { Text } from '../Text';
import { X } from 'lucide-react';
import { ButtonGroup, ButtonGroupProps } from '../ButtonGroup';
import { Button } from '../Button';
import { Density } from '../Density';
import { Display } from '../Display';
import { Grid } from '../Grid';
import { MotionProp } from '../utils/MotionProp';
import { motion } from 'framer-motion';

const Overlay = styled(RadixDialog.Overlay)`
  backdrop-filter: blur(${props => props.theme.blur.xs});
  background-color: ${props => props.theme.color.other.overlay};
  position: fixed;
  inset: 0;
  z-index: auto;
`;

const FullHeightWrapper = styled.div`
  height: 100%;
  min-height: 100svh;
  max-height: 100lvh;
  position: relative;

  display: flex;
  align-items: center;
`;

/**
 * We make a full-screen wrapper around the dialog's content so that we can
 * correctly position it using the same `<Display />`/`<Grid />` as the
 * underlying page uses. Note that we use a `styled.div` here, rather than
 * `styled(RadixDialog.Content)`, because Radix adds an inline `pointer-events:
 * auto` style to that element. We need to make sure there _aren't_ pointer
 * events on the dialog content, because of the aforementioned full-screen
 * wrapper that appears over the `<Overlay />`. We want to make sure that clicks
 * on the full-screen wrapper pass through to the underlying `<Overlay />`, so
 * that the dialog closes when the user clicks there.
 */
const DialogContent = styled.div`
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
`;

const DialogContentCard = styled(motion.div)`
  position: relative;
  width: 100%;
  max-height: 75%;
  box-sizing: border-box;

  background: ${props => props.theme.color.other.dialogBackground};
  border: 1px solid ${props => props.theme.color.other.tonalStroke};
  border-radius: ${props => props.theme.borderRadius.xl};
  backdrop-filter: blur(${props => props.theme.blur.xl});

  display: flex;
  flex-direction: column;

  /**
   * We add 'pointer-events: auto' here so that clicks _inside_ the content card
   * work, even though the _outside_ clicks pass through to the underlying
   * '<Overlay />'.
   */
  pointer-events: auto;
`;

const DialogChildrenWrap = styled.div`
  overflow-y: auto;

  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing(6)};

  padding-bottom: ${props => props.theme.spacing(8)};
  padding-left: ${props => props.theme.spacing(6)};
  padding-right: ${props => props.theme.spacing(6)};
`;

const DialogHeader = styled.header`
  position: sticky;
  top: 0;

  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing(4)};
  color: ${props => props.theme.color.text.primary};

  padding-top: ${props => props.theme.spacing(8)};
  padding-bottom: ${props => props.theme.spacing(6)};
  padding-left: ${props => props.theme.spacing(6)};
  padding-right: ${props => props.theme.spacing(6)};
`;

/**
 * Opening the dialog focuses the first focusable element in the dialog. That's why the Close button
 * should be positioned absolutely and rendered as the last element in the dialog content.
 */
const DialogClose = styled.div`
  position: absolute;
  top: ${props => props.theme.spacing(8)};
  right: ${props => props.theme.spacing(6)};
`;

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

export interface DialogEmptyContentProps {
  children?: ReactNode;
}

const EmptyContent = ({ children }: DialogEmptyContentProps) => {
  return (
    <RadixDialog.Portal>
      <Overlay />

      <RadixDialog.Content>
        <DialogContent>{children}</DialogContent>
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
};
Dialog.EmptyContent = EmptyContent;

/** Internal use only. */
const DialogContext = createContext<{ showCloseButton: boolean }>({
  showCloseButton: true,
});

export interface DialogContentProps<IconOnlyButtonGroupProps extends boolean | undefined>
  extends MotionProp {
  children?: ReactNode;
  /** Renders the element after the dialog title. These elements will be sticky to the top of the dialog */
  headerChildren?: ReactNode;
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
  headerChildren,
  title,
  buttonGroupProps,
  motion,
}: DialogContentProps<IconOnlyButtonGroupProps>) => {
  const { showCloseButton } = useContext(DialogContext);

  return (
    <EmptyContent>
      <Display>
        <Grid container>
          <Grid mobile={0} tablet={2} desktop={3} xl={4} />

          <Grid mobile={12} tablet={8} desktop={6} xl={4}>
            <FullHeightWrapper>
              <DialogContentCard {...motion}>
                <DialogHeader>
                  <RadixDialog.Title asChild>
                    <Text xxl as='h2'>
                      {title}
                    </Text>
                  </RadixDialog.Title>
                  {headerChildren}
                </DialogHeader>

                <DialogChildrenWrap>
                  {children}

                  {buttonGroupProps && <ButtonGroup {...buttonGroupProps} column />}
                </DialogChildrenWrap>

                {showCloseButton && (
                  <Density compact>
                    <RadixDialog.Close asChild>
                      <DialogClose>
                        <Button icon={X} iconOnly priority='secondary'>
                          Close
                        </Button>
                      </DialogClose>
                    </RadixDialog.Close>
                  </Density>
                )}
              </DialogContentCard>
            </FullHeightWrapper>
          </Grid>

          <Grid mobile={0} tablet={2} desktop={3} xl={4} />
        </Grid>
      </Display>
    </EmptyContent>
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
