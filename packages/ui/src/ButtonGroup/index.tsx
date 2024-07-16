import { LucideIcon } from 'lucide-react';
import { MouseEventHandler } from 'react';
import { ActionType, Size } from '../utils/button';
import { Button } from '../Button';
import styled from 'styled-components';
import { media } from '../utils/media';

const Root = styled.div<{ $size: Size }>`
  display: flex;
  flex-direction: ${props => (props.$size === 'sparse' ? 'column' : 'row')};
  gap: ${props => props.theme.spacing(2)};

  ${props => media.tablet`
    flex-direction: row;
    gap: ${props.theme.spacing(props.$size === 'sparse' ? 4 : 2)};
  `}
`;

const ButtonWrapper = styled.div<{ $size: Size }>`
  flex-grow: ${props => (props.$size === 'sparse' ? 1 : 0)};
  flex-shrink: ${props => (props.$size === 'sparse' ? 1 : 0)};
`;

interface ButtonDescription {
  label: string;
  icon?: LucideIcon;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

export interface ButtonGroupProps {
  /**
   * An array of objects, each describing a button to render. The first will be
   * rendered with the `primary` variant, the rest with the `secondary` variant.
   *
   * Minimum length: 1. Maximum length: 3.
   */
  buttons:
    | [ButtonDescription]
    | [ButtonDescription, ButtonDescription]
    | [ButtonDescription, ButtonDescription, ButtonDescription];
  /**
   * The action type of the button group. Will be used for all buttons in the
   * group.
   */
  actionType?: ActionType;
  /** Will be used for all buttons in the group. */
  size?: Size;
}

/**
 * Use a `<ButtonGroup />` to render multiple buttons in a group with the same
 * `actionType` and `size`.
 *
 * When rendering multiple Penumbra UI buttons together, always use a `<ButtonGroup />` rather than individual `<Button />`s. This ensures that they always meet Penumbra UI guidelines. (For example, all buttons in a group should have the same `actionType`; and the first button in a group should be the `primary` variant, while subsequent buttons are the `secondary` variant.)
 */
export const ButtonGroup = ({
  buttons,
  actionType = 'default',
  size = 'sparse',
}: ButtonGroupProps) => (
  <Root $size={size}>
    {buttons.map((action, index) => (
      <ButtonWrapper key={index} $size={size}>
        <Button
          icon={action.icon}
          actionType={actionType}
          onClick={action.onClick}
          variant={index === 0 ? 'primary' : 'secondary'}
          size={size}
        >
          {action.label}
        </Button>
      </ButtonWrapper>
    ))}
  </Root>
);
