import * as RadixTooltip from '@radix-ui/react-tooltip';
import { ReactNode } from 'react';
import styled, { keyframes } from 'styled-components';
import { Text } from '../Text';
import { buttonBase } from '../utils/button';
import { small } from '../utils/typography';

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const Content = styled(RadixTooltip.Content).attrs(props => ({
  sideOffset: props.theme.spacing(1, 'number'),
}))`
  width: 200px;
  padding: ${props => props.theme.spacing(2)};

  background-color: ${props => props.theme.color.other.dialogBackground};
  border: 1px solid ${props => props.theme.color.other.tonalStroke};
  border-radius: ${props => props.theme.borderRadius.sm};
  backdrop-filter: blur(${props => props.theme.blur.xl});

  color: ${props => props.theme.color.text.primary};

  transform-origin: var(--radix-tooltip-content-transform-origin);
  animation: ${scaleIn} 0.15s ease-out;
`;

const Title = styled.div`
  ${small}

  margin-bottom: ${props => props.theme.spacing(2)}
`;

const Trigger = styled(RadixTooltip.Trigger)`
  ${buttonBase}
`;

export interface TooltipProps {
  /** An optional title to show in larger text above the message. */
  title?: string;
  /**
   * A string message to show in the tooltip. Note that only strings are
   * allowed; for interactive content, use a `<Popover />` or a `<Dialog />`.
   */
  message: string;
  /**
   * The trigger for the tooltip.
   *
   * Note that the trigger will be wrapped in an HTML button element, so only pass content that can be validly nested inside a button (i.e., don't pass another button).
   */
  children: ReactNode;
}

/**
 * Use this for small informational text that should appear adjacent to a piece
 * of content.
 *
 * ```tsx
 * <Tooltip title="Tooltip title" message="Tooltip message">
 *   Hover me
 * </Tooltip>
 * ```
 *
 * ## Differences between `<Dialog />`, `<Popover />`, and `<Tooltip />`.
 *
 * These three components provide similar functionality, but are meant to be
 * used in distinct ways.
 *
 * - `<Dialog />`: Use dialogs for interactive or informational content that
 * should take the user's attention above everything else on the page. Dialogs
 * are typically opened in response to a click from a user, but may also be
 * opened and closed programmatically.
 * - `<Popover />`: Use popovers for interactive or informational content that
 * should be visually tied to a specific element on the page, such as the
 * dropdown menu underneath the menu button. Popovers are typically opened in
 * response to a click from a user, but may also be opened and closed
 * programmatically.
 * - `<Tooltip />`: Use tooltips for plain-text informational content that
 * should be visually tied to a specific element on the page. Tooltips are
 * opened in response to the user hovering over that element.
 */
export const Tooltip = ({ title, message, children }: TooltipProps) => (
  <RadixTooltip.Root>
    <Trigger>
      <Text>{children}</Text>
    </Trigger>
    <RadixTooltip.Portal>
      <Content>
        {title && <Title>{title}</Title>}

        <Text detail>{message}</Text>
      </Content>
    </RadixTooltip.Portal>
  </RadixTooltip.Root>
);
