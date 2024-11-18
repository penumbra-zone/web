import { styled } from 'styled-components';
import { Toggle } from '../Toggle';
import { Text } from '../Text';
import { Tooltip } from '../Tooltip';
import { Icon } from '../Icon';
import { Info } from 'lucide-react';

const Root = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing(2)};
`;

export interface IbcDepositToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export const IbcDepositToggle = ({ value, onChange }: IbcDepositToggleProps) => (
  <Root>
    <Tooltip message='IBC transfers into Penumbra post the destination address in public on the source chain. Use this randomized IBC deposit address to preserve privacy when transferring funds into Penumbra.'>
      <Row>
        <Text detail>IBC Deposit</Text>
        <Icon IconComponent={Info} size='sm' />
      </Row>
    </Tooltip>

    <Toggle value={value} onChange={onChange} label='IBC Deposit' />
  </Root>
);
