import type { MouseEventHandler } from 'react';
import { Wallet } from 'lucide-react';
import cn from 'clsx';
import type { BalancesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { getFormattedAmtFromValueView } from '@penumbra-zone/types/value-view';
import {
  getAddressIndex,
  getBalanceView,
  getMetadataFromBalancesResponse,
} from '@penumbra-zone/getters/balances-response';
import { ActionType, getOutlineColorByActionType } from '../utils/action-type';
import { Text } from '../Text';

const getColorByActionType = (actionType: ActionType, disabled?: boolean): string => {
  if (disabled) {
    return cn('text-text-muted');
  }
  if (actionType === 'destructive') {
    return cn('text-destructive-light');
  }
  return cn('text-text-secondary');
};

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
    <div
      className={cn(
        'flex items-center gap-1',
        'transition-colors duration-150',
        'focus-within:text-text-secondary',
        getColorByActionType(actionType, disabled),
      )}
    >
      <button
        type='button'
        disabled={disabled}
        onClick={onClick}
        className={cn(
          'peer',
          'flex items-center gap-1 px-2 py-1',
          'transition-colors duration-150',
          'rounded-full border-none bg-other-tonal-fill5',
          'hover:bg-action-hover-overlay',
          'outline-0 focus:bg-other-tonal-fill5 focus:outline-2 focus:outline-solid',
          getOutlineColorByActionType(actionType),
        )}
      >
        <Wallet className='size-4 transition-colors duration-150' />
        <Text detailTechnical>#{account.account}</Text>
      </button>

      <Text detailTechnical>
        {getFormattedAmtFromValueView(valueView, true)} {metadata.symbol || 'Unknown'}
      </Text>
    </div>
  );
};
