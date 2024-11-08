import { styled } from 'styled-components';
import { AssetIcon } from '../AssetIcon';
import { Text } from '../Text';
import { getFormattedAmtFromValueView } from '@penumbra-zone/types/value-view';
import {
  getAddressIndex,
  getBalanceView,
  getMetadataFromBalancesResponse,
} from '@penumbra-zone/getters/balances-response';
import { ActionType } from '../utils/ActionType';
import { AssetSelectorValue } from './shared/types';
import { media } from '../utils/media';
import { getHash, isBalancesResponse } from './shared/helpers';
import { RadioItem } from '../Dialog/RadioItem';
import { useAssetsSelector } from './shared/Context';

const AssetTitleText = styled(Text)`
  display: inline-block;
  max-width: 100px;

  ${media.tablet`
      max-width: 300px;
  `}

  ${media.lg`
      max-width: 400px;
  `}
`;

const Balance = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

export interface AssetSelectorItemProps {
  /**
   * A `BalancesResponse` or `Metadata` protobuf message type. Renders the asset
   * icon name and, depending on the type, the value of the asset in the account.
   * */
  value: AssetSelectorValue;
  disabled?: boolean;
  actionType?: ActionType;
}

/** A radio button that selects an asset or a balance from the `AssetSelector` */
export const Item = ({ value, disabled, actionType = 'default' }: AssetSelectorItemProps) => {
  const { onClose, onChange } = useAssetsSelector();

  const hash = getHash(value);

  const metadata = isBalancesResponse(value)
    ? getMetadataFromBalancesResponse.optional(value)
    : value;

  const balance = isBalancesResponse(value)
    ? {
        addressIndexAccount: getAddressIndex.optional(value)?.account,
        valueView: getBalanceView.optional(value),
      }
    : undefined;

  // click is triggered by radix-ui on focus, click, arrow selection, etc. – basically always
  const onSelect = () => {
    onChange?.(value);
  };

  return (
    <RadioItem
      value={hash}
      description={metadata?.name}
      actionType={actionType}
      disabled={disabled}
      onClose={onClose}
      onSelect={onSelect}
      startAdornment={<AssetIcon size='lg' metadata={metadata} />}
      title={
        <>
          {balance?.valueView && (
            <Text body truncate>
              {getFormattedAmtFromValueView(balance.valueView, true)}{' '}
            </Text>
          )}
          <AssetTitleText body truncate>
            {metadata?.symbol ?? 'Unknown'}
          </AssetTitleText>
        </>
      }
      endAdornment={
        balance?.addressIndexAccount !== undefined && (
          <Balance>
            <Text technical color={color => color.text.secondary}>
              #{balance.addressIndexAccount}
            </Text>
            <Text detailTechnical color={color => color.text.secondary}>
              Account
            </Text>
          </Balance>
        )
      }
    />
  );
};
