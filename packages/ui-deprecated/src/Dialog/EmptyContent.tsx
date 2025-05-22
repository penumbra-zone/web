import { ReactNode } from 'react';
import {
  Overlay as RadixDialogOverlay,
  Portal as RadixDialogPortal,
  Content as RadixDialogContent,
} from '@radix-ui/react-dialog';
import { styled } from 'styled-components';

// Create a version that explicitly handles ref
const StyledOverlay = styled(RadixDialogOverlay)`
  backdrop-filter: blur(${props => props.theme.blur.xs});
  background-color: ${props => props.theme.color.other.overlay};
  position: fixed;
  inset: 0;
  z-index: auto;
`;

// Accept ref as a prop instead of using forwardRef
const Overlay = ({
  ref,
  ...props
}: React.ComponentProps<typeof RadixDialogOverlay> & {
  ref?: React.Ref<HTMLDivElement>;
}) => {
  return <StyledOverlay {...props} ref={ref} />;
};

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
const DialogContent = styled.div<{ $zIndex?: number }>`
  position: fixed;
  inset: 0;
  pointer-events: none;
  ${props => props.$zIndex && `z-index: ${props.$zIndex};`}
`;

// Accept ref as a prop instead of using forwardRef
const Content = ({
  ref,
  ...props
}: React.ComponentProps<typeof RadixDialogContent> & {
  ref?: React.Ref<HTMLDivElement>;
}) => {
  return <RadixDialogContent {...props} ref={ref} />;
};

export interface DialogEmptyContentProps {
  children?: ReactNode;
  /** @deprecated this prop will be removed in the future */
  zIndex?: number;
}

export const EmptyContent = ({ children, zIndex }: DialogEmptyContentProps) => {
  return (
    <RadixDialogPortal>
      <Overlay />

      <Content>
        <DialogContent $zIndex={zIndex}>{children}</DialogContent>
      </Content>
    </RadixDialogPortal>
  );
};
