import { AssetIcon } from '../AssetIcon';
import { Text } from '../Text';
import { getFormattedAmtFromValueView } from '@penumbra-zone/types/value-view';
import {
  getAddressIndex,
  getBalanceView,
  getMetadataFromBalancesResponse,
} from '@penumbra-zone/getters/balances-response';
import { ActionType } from '../utils/action-type';
import { AssetSelectorValue } from './shared/types';
import { getHash, isBalancesResponse } from './shared/helpers';
import { RadioItem } from '../Dialog/RadioItem';
import { useAssetsSelector } from './shared/Context';

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
            <Text body truncate color='text.primary'>
              {getFormattedAmtFromValueView(balance.valueView, true)}{' '}
            </Text>
          )}
          <span className='inline-block max-w-[100px] tablet:max-w-[300px] lg:max-w-[400px]'>
            <Text body truncate color='text.primary'>
              {metadata?.symbol ?? 'Unknown'}
            </Text>
          </span>
        </>
      }
      endAdornment={
        balance?.addressIndexAccount !== undefined && (
          <div className='flex flex-col items-end'>
            <Text technical color='text.secondary'>
              #{balance.addressIndexAccount}
            </Text>
            <Text detailTechnical color='text.secondary'>
              Account
            </Text>
          </div>
        )
      }
    />
  );
};
