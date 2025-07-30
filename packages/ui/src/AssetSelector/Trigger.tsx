import { MouseEventHandler } from 'react';
import { ChevronsUpDownIcon } from 'lucide-react';
import cn from 'clsx';
import { getMetadataFromBalancesResponse } from '@penumbra-zone/getters/balances-response';
import { ActionType, getFocusOutlineColorByActionType } from '../utils/action-type';
import { useDensity } from '../utils/density';
import { Icon } from '../Icon';
import { Text } from '../Text';
import { AssetIcon } from '../AssetIcon';
import { isMetadata } from './shared/helpers.ts';
import { Dialog } from '../Dialog';
import { AssetSelectorValue } from './shared/types';

export interface AssetSelectorTriggerProps {
  value?: AssetSelectorValue;
  actionType?: ActionType;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  layoutId?: string;
}

export const AssetSelectorTrigger = ({
  ref,
  value,
  actionType = 'default',
  disabled,
  onClick,
}: AssetSelectorTriggerProps & {
  ref?: React.RefObject<HTMLButtonElement>;
}) => {
  const density = useDensity();

  const metadata = isMetadata(value) ? value : getMetadataFromBalancesResponse.optional(value);

  return (
    <Dialog.Trigger asChild>
      <button
        ref={ref}
        type='button'
        disabled={disabled}
        onClick={onClick}
        className={cn(
          'flex min-w-20 items-center justify-between gap-1 rounded-xs bg-other-tonal-fill5',
          'outline-2 outline-transparent transition-[background-color,outline-color] duration-150 outline-solid',
          density === 'sparse' ? 'h-12 px-3 py-0' : 'h-8 px-2 py-0',
          'hover:bg-action-hover-overlay disabled:bg-button-disabled',
          'focus:bg-other-tonal-fill5 focus:text-text-secondary',
          getFocusOutlineColorByActionType(actionType),
        )}
      >
        {!value ? (
          <Text small color={disabled ? 'text.muted' : 'text.primary'}>
            Asset
          </Text>
        ) : (
          <div className={cn('flex items-center', density === 'sparse' ? 'gap-2' : 'gap-1')}>
            <AssetIcon metadata={metadata} size={density === 'sparse' ? 'lg' : 'md'} />
            <span className='inline-block max-w-[120px] truncate'>
              <Text color={disabled ? 'text.muted' : 'text.primary'}>
                {metadata?.symbol ?? 'Unknown'}
              </Text>
            </span>
          </div>
        )}

        <i
          className={cn(
            'flex size-6 items-center justify-center rounded-full p-1',
            disabled ? 'bg-action-disabled-overlay' : 'bg-transparent',
          )}
        >
          <Icon
            IconComponent={ChevronsUpDownIcon}
            size='sm'
            color={disabled ? 'text.muted' : 'text.primary'}
          />
        </i>
      </button>
    </Dialog.Trigger>
  );
};
AssetSelectorTrigger.displayName = 'AssetSelectorTrigger';
