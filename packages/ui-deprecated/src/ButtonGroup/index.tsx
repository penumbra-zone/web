import { LucideIcon } from 'lucide-react';
import { MouseEventHandler } from 'react';
import { ActionType } from '../utils/ActionType';
import { Button } from '../Button';
import { styled } from 'styled-components';
import { media } from '../utils/media';
import { Density } from '../types/Density';
import { useDensity } from '../hooks/useDensity';

const Root = styled.div<{ $density: Density; $column?: boolean }>`
  display: flex;
  flex-direction: ${props => (props.$density === 'sparse' || props.$column ? 'column' : 'row')};
  gap: ${props => props.theme.spacing(2)};

  ${props =>
    !props.$column &&
    media.tablet`
    flex-direction: row;
    gap: ${props.theme.spacing(props.$density === 'sparse' ? 4 : 2)};
  `}
`;

const ButtonWrapper = styled.div<{ $density: Density; $iconOnly?: boolean }>`
  flex-grow: ${props => (props.$density === 'sparse' && !props.$iconOnly ? 1 : 0)};
  flex-shrink: ${props => (props.$density === 'sparse' && !props.$iconOnly ? 1 : 0)};
`;

type ButtonDescription<IconOnly extends boolean> = {
  label: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
} & (IconOnly extends true ? { icon: LucideIcon } : { icon?: LucideIcon });

export interface ButtonGroupProps<IconOnly extends boolean> {
  /**
   * An array of objects, each describing a button to render. The first will be
   * rendered with the `primary` priority, the rest with the `secondary`
   * priority.
   */
  buttons: ButtonDescription<IconOnly>[];
  /**
   * The action type of the button group. Will be used for all buttons in the
   * group.
   */
  actionType?: ActionType;
  /**
   * When `true`, will render just icon buttons. The label for each button will
   * be used as the `aria-label`.
   *
   * Will be used for all buttons in the group.
   */
  iconOnly?: IconOnly;
  /**
   * In some cases, you will want to disable responsiveness and enforce that
   * buttons are always rendered in a column, rather than a row (such as in a
   * narrow layout width, such as a dialog). In those cases, set this to `true`.
   */
  column?: boolean;
  /**
   * Often, a button group should have a primary button for the action that the
   * user is most likely to take. In those cases, pass `hasPrimaryButton` to
   * `<ButtonGroup />`. When you do, the first button will have a `priority` of
   * `primary`, while the rest will be `secondary`. (Note that there can only be
   * one primary button in a button group.)
   */
  hasPrimaryButton?: boolean;
}

const isIconOnly = (props: ButtonGroupProps<boolean>): props is ButtonGroupProps<true> =>
  !!props.iconOnly;

/**
 * Use a `<ButtonGroup />` to render multiple buttons in a group with the same
 * `actionType`.
 *
 * When rendering multiple Penumbra UI buttons together, always use a
 * `<ButtonGroup />` rather than individual `<Button />`s. This ensures that
 * they always meet Penumbra UI guidelines. (For example, all buttons in a group
 * should have the same `actionType`; and the first button in a group can have
 * the `primary` priority, while subsequent buttons have the `secondary`
 * priority.)
 */
export const ButtonGroup = ({
  actionType = 'default',
  column,
  hasPrimaryButton,
  ...props
}: ButtonGroupProps<boolean>) => {
  const density = useDensity();

  return (
    <Root $density={density} $column={column}>
      {/* Annoying TypeScript workaround — we need to explicitly delineate the
      `isIconOnly` and `!isIconOnly` cases, since TypeScript won't resolve the
      compatibility of the icon-only and non-icon-only types otherwise. If
      someone comes up with a better way to do this, feel free to revisit this.
      */}
      {isIconOnly(props) &&
        props.buttons.map((button, index) => (
          <ButtonWrapper key={index} $density={density} $iconOnly>
            <Button
              icon={button.icon}
              actionType={actionType}
              onClick={button.onClick}
              iconOnly
              priority={index === 0 && hasPrimaryButton ? 'primary' : 'secondary'}
            >
              {button.label}
            </Button>
          </ButtonWrapper>
        ))}

      {!isIconOnly(props) &&
        props.buttons.map((button, index) => (
          <ButtonWrapper key={index} $density={density}>
            <Button
              icon={button.icon}
              actionType={actionType}
              onClick={button.onClick}
              priority={index === 0 && hasPrimaryButton ? 'primary' : 'secondary'}
            >
              {button.label}
            </Button>
          </ButtonWrapper>
        ))}
    </Root>
  );
};
