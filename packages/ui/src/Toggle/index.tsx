import * as RadixToggle from '@radix-ui/react-toggle';
import { useDisabled } from '../hooks/useDisabled';
import { styled } from 'styled-components';
import { buttonBase } from '../utils/button';
import { useDensity } from '../hooks/useDensity';
import { Density } from '../types/Density';

const SPARSE_INDICATOR_SIZE = 24;
const COMPACT_INDICATOR_SIZE = 16;

const Root = styled(RadixToggle.Root)<{ $density: Density }>`
  ${buttonBase}

  border: 1px solid ${props => props.theme.color.other.tonalStroke};
  border-radius: ${props => props.theme.borderRadius.full};

  width: ${props =>
    props.$density === 'sparse' ? SPARSE_INDICATOR_SIZE * 2 : COMPACT_INDICATOR_SIZE * 2}px;

  background-color: ${props =>
    props.pressed ? props.theme.color.primary.main : props.theme.color.base.transparent};
  transition: background-color 0.15s;
`;

const Indicator = styled.div<{ $value: boolean; $density: Density }>`
  background-color: ${props =>
    props.$value ? props.theme.color.primary.contrast : props.theme.color.neutral.light};
  border-radius: ${props => props.theme.borderRadius.full};

  width: ${props =>
    props.$density === 'sparse' ? SPARSE_INDICATOR_SIZE : COMPACT_INDICATOR_SIZE}px;
  height: ${props =>
    props.$density === 'sparse' ? SPARSE_INDICATOR_SIZE : COMPACT_INDICATOR_SIZE}px;

  transition:
    transform 0.15s,
    background-color 0.15s;
  transform: translateX(${props => (props.$value ? '100%' : '0')});
`;

export interface ToggleProps {
  /** An accessibility label. */
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  /** @todo: Implement disabled state visually. */
  disabled?: boolean;
}

export const Toggle = ({ label, value, onChange, disabled }: ToggleProps) => {
  const density = useDensity();

  return (
    <Root
      aria-label={label}
      pressed={value}
      onPressedChange={onChange}
      disabled={useDisabled(disabled)}
      $density={density}
    >
      <Indicator $value={value} $density={density} />
    </Root>
  );
};
