import styled, { DefaultTheme } from 'styled-components';
import { button } from '../utils/typography';
import { focusOutline, overlays, reset } from '../utils/button';
import { Density } from '../types/Density';
import { useDensity } from '../hooks/useDensity';

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
  ${reset}
  ${button}
  ${overlays}
  ${focusOutline}

  color:${props => props.theme.color.base.white};
  border: 1px solid
    ${props =>
      props.$selected ? props.theme.color.neutral.light : props.theme.color.base.transparent};
  border-radius: ${props => props.theme.borderRadius.full};

  padding-top: ${props => props.theme.spacing(props.$density === 'sparse' ? 2 : 1)};
  padding-bottom: ${props => props.theme.spacing(props.$density === 'sparse' ? 2 : 1)};
  padding-left: ${props => props.theme.spacing(props.$density === 'sparse' ? 4 : 2)};
  padding-right: ${props => props.theme.spacing(props.$density === 'sparse' ? 4 : 2)};
`;

export interface Option<ValueType extends { toString: () => string }> {
  value: ValueType;
  label: string;
  disabled?: boolean;
}

export interface SegmentedControlProps<ValueType extends { toString: () => string }> {
  value: ValueType;
  onChange: (value: ValueType) => void;
  options: Option<ValueType>[];
}

export const SegmentedControl = <ValueType extends { toString: () => string }>({
  value,
  onChange,
  options,
}: SegmentedControlProps<ValueType>) => {
  const density = useDensity();

  return (
    <Root>
      {options.map(option => (
        <Segment
          key={option.value.toString()}
          onClick={() => onChange(option.value)}
          $getBorderRadius={theme => theme.borderRadius.full}
          $getFocusOutlineColor={theme => theme.color.neutral.light}
          $selected={value === option.value}
          $density={density}
          disabled={option.disabled}
        >
          {option.label}
        </Segment>
      ))}
    </Root>
  );
};
