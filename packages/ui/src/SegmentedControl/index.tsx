import styled, { DefaultTheme } from 'styled-components';
import { button } from '../utils/typography';
import { focusOutline, overlays, buttonBase } from '../utils/button';
import { Density } from '../types/Density';
import { useDensity } from '../hooks/useDensity';
import * as RadixRadioGroup from '@radix-ui/react-radio-group';
import { useDisabled } from '../hooks/useDisabled';

const Root = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing(2)};
`;

const Segment = styled.button<{
  $getFocusOutlineColor: (theme: DefaultTheme) => string;
  $getBorderRadius: (theme: DefaultTheme) => string;
  $selected: boolean;
  $density: Density;
}>`
  ${buttonBase}
  ${button}
  ${overlays}
  ${focusOutline}

  color:${props => props.theme.color.base.white};
  border: 1px solid
    ${props =>
      props.$selected ? props.theme.color.neutral.light : props.theme.color.other.tonalStroke};
  border-radius: ${props => props.theme.borderRadius.full};

  padding-top: ${props => props.theme.spacing(props.$density === 'sparse' ? 2 : 1)};
  padding-bottom: ${props => props.theme.spacing(props.$density === 'sparse' ? 2 : 1)};
  padding-left: ${props => props.theme.spacing(props.$density === 'sparse' ? 4 : 2)};
  padding-right: ${props => props.theme.spacing(props.$density === 'sparse' ? 4 : 2)};
`;

export interface Option {
  value: string;
  label: string;
  /** Whether this individual option should be disabled. */
  disabled?: boolean;
}

export interface SegmentedControlProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  /**
   * Whether this entire control should be disabled. Note that single options
   * can be disabled individually by setting the `disabled` property for that
   * given option.
   */
  disabled?: boolean;
}

/**
 * Renders a segmented control where only one option can be selected at a time.
 * Functionally equivalent to a `<select>` element or a set of radio buttons,
 * but looks nicer when you only have a few options to choose from. (Probably
 * shouldn't be used with more than 5 options.)
 *
 * Fully accessible and keyboard-controllable.
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
export const SegmentedControl = ({ value, onChange, options, disabled }: SegmentedControlProps) => {
  const density = useDensity();
  disabled = useDisabled(disabled);

  return (
    <RadixRadioGroup.Root asChild value={value} onValueChange={onChange}>
      <Root>
        {options.map(option => (
          <RadixRadioGroup.Item asChild key={option.value} value={option.value}>
            <Segment
              onClick={() => onChange(option.value)}
              $getBorderRadius={theme => theme.borderRadius.full}
              $getFocusOutlineColor={theme => theme.color.neutral.light}
              $selected={value === option.value}
              $density={density}
              disabled={disabled || option.disabled}
            >
              {option.label}
            </Segment>
          </RadixRadioGroup.Item>
        ))}
      </Root>
    </RadixRadioGroup.Root>
  );
};
