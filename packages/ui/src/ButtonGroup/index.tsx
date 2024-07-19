import { LucideIcon } from 'lucide-react';
import { MouseEventHandler } from 'react';
import { ActionType, Size } from '../utils/button';
import { Button } from '../Button';
import styled from 'styled-components';
import { media } from '../utils/media';
import { ButtonVariantContext } from '../ButtonVariantContext';

const Root = styled.div<{ $size: Size }>`
  display: flex;
  flex-direction: ${props => (props.$size === 'sparse' ? 'column' : 'row')};
  gap: ${props => props.theme.spacing(2)};

  ${props => media.tablet`
    flex-direction: row;
    gap: ${props.theme.spacing(props.$size === 'sparse' ? 4 : 2)};
  `}
`;

const ButtonWrapper = styled.div<{ $size: Size; $iconOnly?: boolean }>`
  flex-grow: ${props => (props.$size === 'sparse' && !props.$iconOnly ? 1 : 0)};
  flex-shrink: ${props => (props.$size === 'sparse' && !props.$iconOnly ? 1 : 0)};
`;

type ButtonDescription<IconOnly extends boolean> = {
  label: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
} & (IconOnly extends true ? { icon: LucideIcon } : { icon?: LucideIcon });

export interface ButtonGroupProps<IconOnly extends boolean> {
  /**
   * An array of objects, each describing a button to render. The first will be
   * rendered with the `primary` variant, the rest with the `secondary` variant.
   */
  buttons: ButtonDescription<IconOnly>[];
  /**
   * The action type of the button group. Will be used for all buttons in the
   * group.
   */
  actionType?: ActionType;
  /** Will be used for all buttons in the group. */
  size?: Size;
  /**
   * When `true`, will render just icon buttons. The label for each button will
   * be used as the `aria-label`.
   *
   * Will be used for all buttons in the group.
   */
  iconOnly?: IconOnly;
}

const isIconOnly = (props: ButtonGroupProps<boolean>): props is ButtonGroupProps<true> =>
  !!props.iconOnly;

/**
 * Use a `<ButtonGroup />` to render multiple buttons in a group with the same
 * `actionType` and `size`.
 *
 * When rendering multiple Penumbra UI buttons together, always use a `<ButtonGroup />` rather than individual `<Button />`s. This ensures that they always meet Penumbra UI guidelines. (For example, all buttons in a group should have the same `actionType`; and the first button in a group should be the `primary` variant, while subsequent buttons are the `secondary` variant.)
 */
export const ButtonGroup = ({
  actionType = 'default',
  size = 'sparse',
  ...props
}: ButtonGroupProps<boolean>) => (
  <Root $size={size}>
    {/* Annoying TypeScript workaround — we need to explicitly delineate the
      `isIconOnly` and `!isIconOnly` cases, since TypeScript won't resolve the
      compatibility of the icon-only and non-icon-only types otherwise. If
      someone comes up with a better way to do this, feel free to revisit this.
      */}
    {isIconOnly(props) &&
      props.buttons.map((button, index) => (
        <ButtonVariantContext.Provider key={index} value={index === 0 ? 'primary' : 'secondary'}>
          <ButtonWrapper $size={size} $iconOnly>
            <Button
              icon={button.icon}
              actionType={actionType}
              onClick={button.onClick}
              size={size}
              iconOnly
            >
              {button.label}
            </Button>
          </ButtonWrapper>
        </ButtonVariantContext.Provider>
      ))}

    {!isIconOnly(props) &&
      props.buttons.map((button, index) => (
        <ButtonVariantContext.Provider key={index} value={index === 0 ? 'primary' : 'secondary'}>
          <ButtonWrapper $size={size}>
            <Button icon={button.icon} actionType={actionType} onClick={button.onClick} size={size}>
              {button.label}
            </Button>
          </ButtonWrapper>
        </ButtonVariantContext.Provider>
      ))}
  </Root>
);
