import cn from 'clsx';
import { useMemo } from 'react';
import { AssetIcon } from '@penumbra-zone/ui/AssetIcon';
import { round } from '@penumbra-zone/types/round';
import { Dialog } from '@penumbra-zone/ui/Dialog';
import { Text } from '@penumbra-zone/ui/Text';
import type { MappedGauge } from '../../server/previous-epochs';

export const VOTING_THRESHOLD = 0.05;

export interface VoteDialogAssetProps {
  asset: MappedGauge;
  onSelect: VoidFunction;
}

export const VoteAssetIcon = ({ asset }: { asset: MappedGauge }) => {
  return (
    <div className={cn('min-w-8')}>
      <AssetIcon size='lg' metadata={asset.asset} />
    </div>
  );
};

export const formatPercentage = (portion: number): string => {
  if (portion < 0.01) {
    return '<1';
  }
  if (portion === 0) {
    return '0';
  }

  return round({ value: portion * 100, decimals: 0 });
};

export const VoteAssetContent = ({ asset }: { asset: MappedGauge }) => {
  const isSecondary = asset.portion < VOTING_THRESHOLD;

  const percentage = useMemo(() => formatPercentage(asset.portion), [asset.portion]);

  return (
    <div className='ml-1 flex grow flex-col gap-1'>
      <div className='flex w-full justify-between gap-1'>
        <Text technical color={isSecondary ? 'text.secondary' : 'text.primary'}>
          {asset.asset.symbol}
        </Text>
        <Text technical color={isSecondary ? 'neutral.light' : 'text.primary'}>
          {percentage}%
        </Text>
      </div>

      <div className='flex h-1 w-full rounded-full bg-other-tonal-fill5'>
        <div
          className={cn(
            'h-full rounded-full',
            isSecondary ? 'bg-neutral-light' : 'bg-secondary-light',
          )}
          style={{ width: `${asset.portion * 100}%` }}
        />
      </div>
    </div>
  );
};

export const VoteDialogAsset = ({ asset, onSelect }: VoteDialogAssetProps) => {
  return (
    <Dialog.RadioItem
      title=''
      key={asset.asset.base}
      value={asset.asset.base}
      onSelect={onSelect}
      startAdornment={<VoteAssetIcon asset={asset} />}
      endAdornment={<VoteAssetContent asset={asset} />}
    />
  );
};
