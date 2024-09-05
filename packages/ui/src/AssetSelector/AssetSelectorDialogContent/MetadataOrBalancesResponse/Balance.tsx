import { getFormattedAmtFromValueView } from '@penumbra-zone/types/value-view';
import { BalancesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import styled from 'styled-components';
import { Text } from '../../../Text';
import { getAddressIndex, getBalanceView } from '@penumbra-zone/getters/balances-response';

const Root = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

export interface BalanceProps {
  balancesResponse: BalancesResponse;
}

export const Balance = ({ balancesResponse }: BalanceProps) => {
  const addressIndexAccount = getAddressIndex.optional(balancesResponse)?.account;
  const valueView = getBalanceView.optional(balancesResponse);
  return (
    <Root>
      {valueView && <Text>{getFormattedAmtFromValueView(valueView, true)}</Text>}

      {addressIndexAccount !== undefined && (
        <Text detailTechnical color={color => color.text.secondary}>
          Account #{addressIndexAccount}
        </Text>
      )}
    </Root>
  );
};
