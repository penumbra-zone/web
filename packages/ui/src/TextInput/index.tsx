import styled, { DefaultTheme } from 'styled-components';
import { small } from '../utils/typography';
import { ActionType } from '../utils/ActionType';
import { useDisabled } from '../hooks/useDisabled';

const BORDER_BOTTOM_WIDTH = '2px';

const borderColorByActionType: Record<ActionType, keyof DefaultTheme['color']['action']> = {
  default: 'neutralFocusOutline',
  accent: 'primaryFocusOutline',
  unshield: 'unshieldFocusOutline',
  destructive: 'destructiveFocusOutline',
};

const StyledInput = styled.input<{ $actionType: ActionType }>`
  appearance: none;
  border: none;
  background-color: ${props => props.theme.color.other.tonalFill5};
  color: ${props =>
    props.disabled ? props.theme.color.text.muted : props.theme.color.text.primary};

  padding-left: ${props => props.theme.spacing(3)};
  padding-right: ${props => props.theme.spacing(3)};
  padding-top: ${props => props.theme.spacing(2)};
  padding-bottom: calc(${props => props.theme.spacing(2)} - ${BORDER_BOTTOM_WIDTH});
  border-bottom: ${BORDER_BOTTOM_WIDTH} solid ${props => props.theme.color.base.transparent};
  transition: border-color 0.15s;

  box-sizing: border-box;
  width: 100%;

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
}

export const TextInput = ({
  value,
  onChange,
  placeholder,
  actionType = 'default',
  disabled,
  type = 'text',
}: TextInputProps) => {
  disabled = useDisabled(disabled);

  return (
    <StyledInput
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      type={type}
      $actionType={actionType}
    />
  );
};
