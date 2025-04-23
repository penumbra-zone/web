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
  ref: React.RefObject<HTMLButtonElement>;
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
          'flex items-center justify-between gap-1 min-w-20 rounded-none bg-other-tonalFill5',
          'transition-[background-color,outline-color] duration-150 outline outline-2 outline-transparent',
          density === 'sparse' ? 'h-12 py-0 px-3' : 'h-8 py-0 px-2',
          'hover:bg-action-hoverOverlay disabled:bg-buttonDisabled',
          'focus:text-text-secondary focus:bg-other-tonalFill5',
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
            <Text color={disabled ? 'text.muted' : 'text.primary'}>
              {metadata?.symbol ?? 'Unknown'}
            </Text>
          </div>
        )}

        <i
          className={cn(
            'flex items-center justify-center p-1 size-6 rounded-full',
            disabled ? 'bg-action-disabledOverlay' : 'bg-transparent',
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
