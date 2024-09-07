import { RadioGroupItem } from '@radix-ui/react-radio-group';
import { uint8ArrayToHex } from '@penumbra-zone/types/hex';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { AssetIcon } from '../AssetIcon';
import { Text } from '../Text';
import { isBalancesResponse, isEqual, isMetadata, SelectorValue } from './utils/helpers.ts';
import { getFormattedAmtFromValueView } from '@penumbra-zone/types/value-view';
import {
  getAddressIndex,
  getBalanceView,
  getMetadataFromBalancesResponse,
} from '@penumbra-zone/getters/balances-response';
import { ActionType, getOutlineColorByActionType } from '../utils/ActionType.ts';
import { asTransientProps } from '../utils/asTransientProps.ts';
import { KeyboardEventHandler, MouseEventHandler } from 'react';
import { useAssetsSelector } from './utils/Context.tsx';

const Root = styled(motion.button)<{
  $isSelected: boolean;
  $actionType: ActionType;
  $disabled?: boolean;
}>`
  border-radius: ${props => props.theme.borderRadius.sm};
  background-color: ${props => props.theme.color.other.tonalFill5};
  padding: ${props => props.theme.spacing(3)};

  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: left;
  transition:
    background 0.15s,
    outline 0.15s;

  &:hover {
    background: linear-gradient(
        0deg,
        ${props => props.theme.color.action.hoverOverlay} 0%,
        ${props => props.theme.color.action.hoverOverlay} 100%
      ),
      ${props => props.theme.color.other.tonalFill5};
  }

  &:focus {
    background: linear-gradient(
        0deg,
        ${props => props.theme.color.action.hoverOverlay} 0%,
        ${props => props.theme.color.action.hoverOverlay} 100%
      ),
      ${props => props.theme.color.other.tonalFill5};
    outline: 2px solid ${props => getOutlineColorByActionType(props.theme, props.$actionType)};
  }

  &:disabled {
    background: linear-gradient(
        0deg,
        ${props => props.theme.color.action.disabledOverlay} 0%,
        ${props => props.theme.color.action.disabledOverlay} 100%
      ),
      ${props => props.theme.color.other.tonalFill5};
  }
`;

const AssetInfo = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing(2)};
  align-items: center;
`;

const Balance = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

export interface ListItemProps {
  /**
   * A `BalancesResponse` or `Metadata` protobuf message type. Renders the asset
   * icon name and, depending on the type, the value of the asset in the account.
   * */
  value: SelectorValue;
  disabled?: boolean;
  actionType?: ActionType;
}

/** A radio button that selects an asset or a balance from the `AssetSelector` */
export const ListItem = ({ value, disabled, actionType = 'default' }: ListItemProps) => {
  const { onClose, onChange, value: selectedValue } = useAssetsSelector();

  const isSelected = isEqual(value, selectedValue);
  const hash = uint8ArrayToHex(value.toBinary());

  const metadata = isMetadata(value) ? value : getMetadataFromBalancesResponse.optional(value);

  const balance = isBalancesResponse(value)
    ? {
        addressIndexAccount: getAddressIndex.optional(value)?.account,
        valueView: getBalanceView.optional(value),
      }
    : undefined;

  const onEnter: KeyboardEventHandler<HTMLButtonElement> = event => {
    if (event.key === 'Enter') {
      onClose();
    }
  };

  const onMouseDown: MouseEventHandler<HTMLButtonElement> = () => {
    // close only after the value is selected by onClick
    setTimeout(() => {
      onClose();
    }, 0);
  };

  // click is triggered by radix-ui on focus, click, arrow selection, etc. – basically always
  const onClick = () => {
    onChange?.(value);
  };

  return (
    <RadioGroupItem key={hash} disabled={disabled} value={hash} asChild>
      <Root
        {...asTransientProps({ isSelected, actionType, disabled })}
        onKeyDown={onEnter}
        onMouseDown={onMouseDown}
        onClick={onClick}
      >
        <AssetInfo>
          <AssetIcon size='lg' metadata={metadata} />
          <div>
            <div>
              {balance?.valueView && (
                <Text body>{getFormattedAmtFromValueView(balance.valueView, true)} </Text>
              )}
              <Text body>{metadata?.symbol ?? 'Unknown'}</Text>
            </div>
            {metadata?.name && (
              <Text detail color={color => color.text.secondary} as='div'>
                {metadata.name}
              </Text>
            )}
          </div>
        </AssetInfo>

        {balance?.addressIndexAccount !== undefined && (
          <Balance>
            <Text technical color={color => color.text.secondary}>
              #{balance.addressIndexAccount}
            </Text>
            <Text detailTechnical color={color => color.text.secondary}>
              Account
            </Text>
          </Balance>
        )}
      </Root>
    </RadioGroupItem>
  );
};
