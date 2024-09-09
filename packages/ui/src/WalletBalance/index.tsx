import type { MouseEventHandler } from 'react';
import styled, { type DefaultTheme } from 'styled-components';
import { Wallet } from 'lucide-react';
import type { BalancesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { getFormattedAmtFromValueView } from '@penumbra-zone/types/value-view';
import {
  getAddressIndex,
  getBalanceView,
  getMetadataFromBalancesResponse,
} from '@penumbra-zone/getters/balances-response';
import { Text } from '../Text';
import { ActionType, getOutlineColorByActionType } from '../utils/ActionType.ts';
import { asTransientProps } from '../utils/asTransientProps.ts';

interface StyledProps {
  $actionType: ActionType;
  $disabled?: boolean;
}

const getColorByActionType = (
  theme: DefaultTheme,
  actionType: ActionType,
  disabled?: boolean,
): string => {
  if (disabled) {
    return theme.color.text.muted;
  }
  if (actionType === 'destructive') {
    return theme.color.destructive.light;
  }
  return theme.color.text.secondary;
};

const Wrapper = styled.div<StyledProps>`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing(1)};
  color: ${props => getColorByActionType(props.theme, props.$actionType, props.$disabled)};
  transition: color 0.15s;
`;

const AccountWrapper = styled.button<StyledProps>`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing(1)};
  padding: ${props => props.theme.spacing(1)} ${props => props.theme.spacing(2)};

  color: inherit;
  border: none;
  border-radius: ${props => props.theme.borderRadius.full};
  background-color: ${props => props.theme.color.other.tonalFill5};
  transition:
    color 0.15s,
    background 0.15s,
    outline 0.15s;

  &:hover {
    background-color: ${props => props.theme.color.action.hoverOverlay};
  }

  &:focus {
    color: ${props => props.theme.color.text.secondary};
    background-color: ${props => props.theme.color.other.tonalFill5};
    outline: 2px solid ${props => getOutlineColorByActionType(props.theme, props.$actionType)};
  }

  &:focus + span {
    color: ${props => props.theme.color.text.secondary};
  }
`;

const ValueText = styled(Text)`
  color: inherit;
  transition: color 0.15s;
`;

const WalletIcon = styled(Wallet)`
  width: ${props => props.theme.spacing(4)};
  height: ${props => props.theme.spacing(4)};
  transition: color 0.15s;
`;

export interface WalletBalanceProps {
  balance?: BalancesResponse;
  actionType?: ActionType;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

/**
 * `WalletBalance` renders a `BalancesResponse` — its account index, amount,, and symbol.
 * Use this anywhere you would like to render a `BalancesResponse`.
 *
 * Allows clicking on the wallet icon.
 */
export const WalletBalance = ({
  balance,
  actionType = 'default',
  disabled,
  onClick,
}: WalletBalanceProps) => {
  const account = getAddressIndex.optional(balance);
  const valueView = getBalanceView.optional(balance);
  const metadata = getMetadataFromBalancesResponse.optional(balance);

  if (!valueView || !account || !metadata) {
    return null;
  }

  return (
    <Wrapper {...asTransientProps({ actionType, disabled })}>
      <AccountWrapper
        {...asTransientProps({ actionType, disabled })}
        disabled={disabled}
        type='button'
        onClick={onClick}
      >
        <WalletIcon />
        <ValueText detailTechnical>#{account.account}</ValueText>
      </AccountWrapper>

      <ValueText detailTechnical>
        {getFormattedAmtFromValueView(valueView, true)} {metadata.symbol || 'Unknown'}
      </ValueText>
    </Wrapper>
  );
};
