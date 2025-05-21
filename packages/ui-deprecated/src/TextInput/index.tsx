import { styled } from 'styled-components';
import { small } from '../utils/typography';
import { ActionType, getOutlineColorByActionType } from '../utils/ActionType';
import { useDisabled } from '../hooks/useDisabled';
import { ReactNode } from 'react';

const Wrapper = styled.div<{
  $hasStartAdornment: boolean;
  $hasEndAdornment: boolean;
  $actionType: ActionType;
}>`
  background-color: ${props => props.theme.color.other.tonalFill5};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing(2)};
  transition:
    outline 0.15s,
    background-color 0.15s;

  ${props => props.$hasStartAdornment && `padding-left: ${props.theme.spacing(3)};`}
  ${props => props.$hasEndAdornment && `padding-right: ${props.theme.spacing(3)};`}
  
  &:focus-within {
    outline: 2px solid ${props => getOutlineColorByActionType(props.theme, props.$actionType)};
  }

  &:hover {
    background-color: ${props => props.theme.color.action.hoverOverlay};
  }
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
  padding-bottom: ${props => props.theme.spacing(2)};
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
    outline: none;
  }

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &[type='number'] {
    -moz-appearance: textfield;
  }
`;

export interface TextInputProps {
  value?: string;
  onChange?: (value: string) => void;
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
  ref?: React.Ref<HTMLInputElement>;
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
  ref,
}: TextInputProps) => (
  <Wrapper
    $actionType={actionType}
    $hasStartAdornment={!!startAdornment}
    $hasEndAdornment={!!endAdornment}
  >
    {startAdornment}

    <StyledInput
      value={value}
      onChange={e => onChange?.(e.target.value)}
      placeholder={placeholder}
      disabled={useDisabled(disabled)}
      type={type}
      max={max}
      min={min}
      ref={ref}
      $actionType={actionType}
      $hasStartAdornment={!!startAdornment}
      $hasEndAdornment={!!endAdornment}
    />

    {endAdornment}
  </Wrapper>
);
