import styled, { DefaultTheme } from 'styled-components';
import { small } from '../utils/typography';
import { ActionType } from '../utils/ActionType';
import { useDisabled } from '../hooks/useDisabled';
import { ReactNode } from 'react';

const BORDER_BOTTOM_WIDTH = '2px';

const borderColorByActionType: Record<ActionType, keyof DefaultTheme['color']['action']> = {
  default: 'neutralFocusOutline',
  accent: 'primaryFocusOutline',
  unshield: 'unshieldFocusOutline',
  destructive: 'destructiveFocusOutline',
};

const Wrapper = styled.div<{ $hasStartAdornment: boolean; $hasEndAdornment: boolean }>`
  background-color: ${props => props.theme.color.other.tonalFill5};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing(2)};

  ${props => props.$hasStartAdornment && `padding-left: ${props.theme.spacing(3)};`}
  ${props => props.$hasEndAdornment && `padding-right: ${props.theme.spacing(3)};`}
`;

const StyledInput = styled.input<{
  $actionType: ActionType;
  $hasStartAdornment: boolean;
  $hasEndAdornment: boolean;
}>`
  appearance: none;
  border: none;
  color: ${props =>
    props.disabled ? props.theme.color.text.muted : props.theme.color.text.primary};
  background-color: ${props => props.theme.color.base.transparent};

  padding-left: ${props => (props.$hasStartAdornment ? '0' : props.theme.spacing(3))};
  padding-right: ${props => (props.$hasEndAdornment ? '0' : props.theme.spacing(3))};
  padding-top: ${props => props.theme.spacing(2)};
  padding-bottom: calc(${props => props.theme.spacing(2)} - ${BORDER_BOTTOM_WIDTH});
  border-bottom: ${BORDER_BOTTOM_WIDTH} solid ${props => props.theme.color.base.transparent};
  transition: border-color 0.15s;

  box-sizing: border-box;
  flex-grow: 1;

  ${small}

  &::placeholder {
    color: ${props => props.theme.color.text.secondary};
  }

  &:disabled {
    cursor: not-allowed;
  }

  &:disabled::placeholder {
    color: ${props => props.theme.color.text.muted};
  }

  &:focus {
    border-bottom-color: ${props =>
      props.theme.color.action[borderColorByActionType[props.$actionType]]};
    outline: none;
  }
`;

export interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  actionType?: ActionType;
  disabled?: boolean;
  type?: 'email' | 'number' | 'password' | 'tel' | 'text' | 'url';
  /**
   * Markup to render inside the text input's visual frame, before the text
   * input itself.
   */
  startAdornment?: ReactNode;
  /**
   * Markup to render inside the text input's visual frame, after the text input
   * itself.
   */
  endAdornment?: ReactNode;
  max?: string | number;
  min?: string | number;
}

/**
 * A simple text field.
 *
 * Can be enriched with start and end adornments, which are markup that render
 * inside the text input's visual frame.
 */
export const TextInput = ({
  value,
  onChange,
  placeholder,
  actionType = 'default',
  disabled,
  type = 'text',
  startAdornment = null,
  endAdornment = null,
  max,
  min,
}: TextInputProps) => {
  disabled = useDisabled(disabled);

  return (
    <Wrapper $hasStartAdornment={!!startAdornment} $hasEndAdornment={!!endAdornment}>
      {startAdornment}

      <StyledInput
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        type={type}
        max={max}
        min={min}
        $actionType={actionType}
        $hasStartAdornment={!!startAdornment}
        $hasEndAdornment={!!endAdornment}
      />

      {endAdornment}
    </Wrapper>
  );
};
