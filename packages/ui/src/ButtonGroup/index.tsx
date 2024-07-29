import { LucideIcon } from 'lucide-react';
import { MouseEventHandler } from 'react';
import { ActionType } from '../utils/button';
import { Button } from '../Button';
import styled from 'styled-components';
import { media } from '../utils/media';
import { ButtonPriorityContext } from '../utils/ButtonPriorityContext';
import { Density } from '../types/Density';
import { useDensity } from '../hooks/useDensity';

const Root = styled.div<{ $density: Density }>`
  display: flex;
  flex-direction: ${props => (props.$density === 'sparse' ? 'column' : 'row')};
  gap: ${props => props.theme.spacing(2)};

  ${props => media.tablet`
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
 * should have the same `actionType`; and the first button in a group should be
 * the `primary` priority, while subsequent buttons are the `secondary`
 * priority.)
 */
export const ButtonGroup = ({ actionType = 'default', ...props }: ButtonGroupProps<boolean>) => {
  const density = useDensity();

  return (
    <Root $density={density}>
      {/* Annoying TypeScript workaround — we need to explicitly delineate the
      `isIconOnly` and `!isIconOnly` cases, since TypeScript won't resolve the
      compatibility of the icon-only and non-icon-only types otherwise. If
      someone comes up with a better way to do this, feel free to revisit this.
      */}
      {isIconOnly(props) &&
        props.buttons.map((button, index) => (
          <ButtonPriorityContext.Provider key={index} value={index === 0 ? 'primary' : 'secondary'}>
            <ButtonWrapper $density={density} $iconOnly>
              <Button icon={button.icon} actionType={actionType} onClick={button.onClick} iconOnly>
                {button.label}
              </Button>
            </ButtonWrapper>
          </ButtonPriorityContext.Provider>
        ))}

      {!isIconOnly(props) &&
        props.buttons.map((button, index) => (
          <ButtonPriorityContext.Provider key={index} value={index === 0 ? 'primary' : 'secondary'}>
            <ButtonWrapper $density={density}>
              <Button icon={button.icon} actionType={actionType} onClick={button.onClick}>
                {button.label}
              </Button>
            </ButtonWrapper>
          </ButtonPriorityContext.Provider>
        ))}
    </Root>
  );
};
