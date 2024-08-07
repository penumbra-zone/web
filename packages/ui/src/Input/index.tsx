import styled, { DefaultTheme } from 'styled-components';
import { Text } from '../Text';
import { small } from '../utils/typography';
import { ActionType } from '../utils/ActionType';

const Root = styled.label<{ $disabled?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing(2)};
  position: relative;

  ${props =>
    props.$disabled &&
    `
      &::before {
        content: '';
        position: absolute;
        inset: 0;
        background-color: ${props.theme.color.action.disabledOverlay};
        cursor: not-allowed;
      }
    `}
`;

const BORDER_BOTTOM_WIDTH = '2px';

const borderColorByActionType: Record<ActionType, keyof DefaultTheme['color']['action']> = {
  default: 'neutralFocusOutline',
  accent: 'primaryFocusOutline',
  unshield: 'unshieldFocusOutline',
  destructive: 'destructiveFocusOutline',
};

const InputWrapper = styled.div<{ $disabled?: boolean }>`
  position: relative;
  width: 100%;

  ${props =>
    !props.$disabled &&
    `
      &:hover::before {
        content: '';
        position: absolute;
        inset: 0;
        background-color: ${props.theme.color.action.hoverOverlay};
      }
    `}
`;

const StyledInput = styled.input<{ $actionType: ActionType }>`
  appearance: none;
  border: none;
  background-color: ${props => props.theme.color.other.tonalFill5};
  color: ${props => props.theme.color.text.primary};

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

  &:focus {
    border-bottom-color: ${props =>
      props.theme.color.action[borderColorByActionType[props.$actionType]]};
    outline: none;
  }
`;

const HelperText = styled.div`
  color: ${props => props.theme.color.text.secondary};

  ${small}
`;

export interface InputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  actionType?: ActionType;
  disabled?: boolean;
  helperText?: string;
  type?: 'email' | 'number' | 'password' | 'tel' | 'text' | 'url';
}

export const Input = ({
  label,
  value,
  onChange,
  placeholder,
  actionType = 'default',
  disabled,
  helperText,
  type = 'text',
}: InputProps) => {
  return (
    <Root $disabled={disabled}>
      <Text strong>{label}</Text>

      <InputWrapper>
        <StyledInput
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          type={type}
          $actionType={actionType}
        />
      </InputWrapper>

      {helperText && <HelperText>{helperText}</HelperText>}
    </Root>
  );
};
