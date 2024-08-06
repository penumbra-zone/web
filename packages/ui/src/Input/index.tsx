import styled from 'styled-components';
import { Text } from '../Text';
import { small } from '../utils/typography';

const Root = styled.label`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing(2)};
`;

const BORDER_BOTTOM_WIDTH = '2px';

const StyledInput = styled.input`
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

  ${small}

  &::placeholder {
    color: ${props => props.theme.color.text.secondary};
  }

  &:focus {
    border-bottom-color: ${props => props.theme.color.action.neutralFocusOutline};
    outline: none;
  }
`;

export interface InputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const Input = ({ label, value, onChange, placeholder }: InputProps) => {
  return (
    <Root>
      <Text strong>{label}</Text>
      <StyledInput
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </Root>
  );
};
