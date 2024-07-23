import styled, { DefaultTheme } from 'styled-components';
import { tab } from '../utils/typography';
import { motion } from 'framer-motion';
import { useId } from 'react';
import { buttonInteractions } from '../utils/button';
import * as Tabs from '@radix-ui/react-tabs';

const TEN_PERCENT_OPACITY_IN_HEX = '1a';

const Root = styled.div`
  border: 1px solid ${props => props.theme.color.other.tonalStroke};
  border-radius: ${props => props.theme.borderRadius.sm};
  height: 52px;
  padding: ${props => props.theme.spacing(1)};

  display: flex;
  align-items: stretch;
  box-sizing: border-box;
`;

type ActionType = 'default' | 'accent' | 'unshield';

const outlineColorByActionType: Record<ActionType, keyof DefaultTheme['color']['action']> = {
  default: 'neutralFocusOutline',
  accent: 'primaryFocusOutline',
  unshield: 'unshieldFocusOutline',
};

const SegmentButton = styled.button<{
  $actionType: ActionType;
  $getFocusOutlineColor: (theme: DefaultTheme) => string;
  $getBorderRadius: (theme: DefaultTheme) => string;
}>`
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0; /** Ensure equal widths */

  appearance: none;
  background-color: transparent;
  border: none;
  border-radius: ${props => props.theme.borderRadius.xs};
  color: ${props => {
    switch (props.$actionType) {
      case 'accent':
        return props.theme.color.primary.light;
      case 'unshield':
        return props.theme.color.unshield.light;
      default:
        return props.theme.color.text.primary;
    }
  }};
  position: relative;
  white-space: nowrap;
  cursor: pointer;

  ${tab}
  ${buttonInteractions}

  &::after {
    inset: ${props => props.theme.spacing(0.5)};
  }
`;

const SelectedIndicator = styled(motion.div)`
  background-color: ${props => props.theme.color.text.primary + TEN_PERCENT_OPACITY_IN_HEX};
  border-radius: ${props => props.theme.borderRadius.xs};
  position: absolute;
  inset: 0;
  z-index: -1;
`;

export interface SegmentedPickerOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SegmentedPickerProps {
  value: string;
  onChange: (value: string) => void;
  options: SegmentedPickerOption[];
  actionType?: ActionType;
}

/**
 * Renders a segmented picker where only one option can be selected at a time.
 * Functionally equivalent to a `<select>` element or a set of radio buttons,
 * but looks nicer when you only have a few options to choose from. (Probably
 * shouldn't be used with more than 5 options.)
 *
 * @example
 * ```TSX
 * <SegmentedPicker
 *   value={value}
 *   onChange={setValue}
 *   options={[
 *     { value: 'one', label: 'One' },
 *     { value: 'two', label: 'Two' },
 *     { value: 'three', label: 'Three', disabled: true },
 *   ]}
 * />
 * ```
 */
export const SegmentedPicker = ({
  value,
  onChange,
  options,
  actionType = 'default',
}: SegmentedPickerProps) => {
  const layoutId = useId();

  return (
    <Tabs.Root value={value} onValueChange={onChange}>
      <Tabs.List asChild>
        <Root>
          {options.map(option => (
            <Tabs.Trigger
              value={option.value}
              key={option.value.toString()}
              disabled={option.disabled}
              asChild
            >
              <SegmentButton
                onClick={() => onChange(option.value)}
                disabled={option.disabled}
                $actionType={actionType}
                $getFocusOutlineColor={theme =>
                  theme.color.action[outlineColorByActionType[actionType]]
                }
                $getBorderRadius={theme => theme.borderRadius.xs}
              >
                {value === option.value && <SelectedIndicator layout layoutId={layoutId} />}
                {option.label}
              </SegmentButton>
            </Tabs.Trigger>
          ))}
        </Root>
      </Tabs.List>
    </Tabs.Root>
  );
};
