import styled, { DefaultTheme } from 'styled-components';
import { tab } from '../utils/typography';
import { motion } from 'framer-motion';
import { useId } from 'react';

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

const SegmentButton = styled.button<{ $actionType: ActionType }>`
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

  &::before {
    border-radius: ${props => props.theme.borderRadius.xs};
    content: '';
    position: absolute;
    inset: 0;
    z-index: 1;

    transition: background-color 0.15s;
  }

  &::after {
    content: '';
    position: absolute;
    inset: ${props => props.theme.spacing(0.5)};
    z-index: 1;

    outline-width: 2px;
    outline-style: solid;
    outline-color: transparent;
    border-radius: ${props => props.theme.borderRadius.xs};

    transition: outline-color 0.15s;
  }

  &:disabled::after {
    pointer-events: none;
  }

  &:hover::before {
    background-color: ${props => props.theme.color.action.hoverOverlay};
  }

  &:active::before {
    background-color: ${props => props.theme.color.action.activeOverlay};
  }

  /**
   * The focus outline is styled on the \`::after\` pseudo-element, rather than
   * just adding an \`outline\`. This is because, if we only used \`outline\`,
   * and the currently focused button is right before a disabled button, the
   * overlay of the disabled button would be above the outline, making the
   * outline appear to be partly cut off.
   */
  &:focus::after {
    outline-color: ${props =>
      props.theme.color.action[outlineColorByActionType[props.$actionType]]};
  }

  &:disabled::before {
    background-color: ${props => props.theme.color.action.disabledOverlay};
    cursor: not-allowed;
  }
`;

const SelectedIndicator = styled(motion.div)`
  background-color: ${props => props.theme.color.text.primary + TEN_PERCENT_OPACITY_IN_HEX};
  border-radius: ${props => props.theme.borderRadius.xs};
  position: absolute;
  inset: 0;
  z-index: -1;
`;

export interface SegmentedPickerOption<ValueType> {
  /**
   * The value to pass to the `onChange` handler when clicked. Must be unique
   * across all segments, and must be either a string, number, or an object with
   * a `.toString()` method so that it can be used as a React key.
   */
  value: ValueType;
  label: string;
  disabled?: boolean;
}

export interface SegmentedPickerProps<ValueType extends { toString: () => string }> {
  /**
   * The currently selected value. Will be compared to the `options`' `value`
   * property using `===` to determine which segment is selected.
   */
  value: ValueType;
  onChange: (value: ValueType) => void;
  options: SegmentedPickerOption<ValueType>[];
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
export const SegmentedPicker = <ValueType extends { toString: () => string }>({
  value,
  onChange,
  options,
  actionType = 'default',
}: SegmentedPickerProps<ValueType>) => {
  const layoutId = useId();

  return (
    <Root>
      {options.map(option => (
        <SegmentButton
          key={option.value.toString()}
          onClick={() => onChange(option.value)}
          $actionType={actionType}
          disabled={option.disabled}
        >
          {value === option.value && <SelectedIndicator layout layoutId={layoutId} />}
          {option.label}
        </SegmentButton>
      ))}
    </Root>
  );
};
