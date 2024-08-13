import styled from 'styled-components';
import { Toggle } from '../Toggle';
import { Text } from '../Text';

const Root = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export interface IbcDepositToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export const IbcDepositToggle = ({ value, onChange }: IbcDepositToggleProps) => {
  return (
    <Root>
      <Text detail>IBC Deposit</Text>
      <Toggle value={value} onChange={onChange} label='IBC Deposit' />
    </Root>
  );
};
