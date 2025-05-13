import cn from 'clsx';
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

export const getVoteAssetComponents = (asset: MappedGauge) => {
  const isSecondary = asset.portion < VOTING_THRESHOLD;

  let percentage = round({ value: asset.portion * 100, decimals: 0 });
  if (asset.portion < 0.01) {
    percentage = '<1';
  }
  if (asset.portion === 0) {
    percentage = '0';
  }

  return {
    icon: (
      <div className={cn('min-w-8', isSecondary && 'grayscale')}>
        <AssetIcon size='lg' metadata={asset.asset} />
      </div>
    ),
    content: (
      <div className='grow flex flex-col gap-1 ml-1'>
        <div className='flex w-full justify-between gap-1'>
          <Text technical color='text.primary'>
            {asset.asset.symbol}
          </Text>
          <Text technical color={isSecondary ? 'neutral.light' : 'text.primary'}>
            {percentage}%
          </Text>
        </div>

        <div className='flex w-full h-1 bg-other-tonalFill5 rounded-full'>
          <div
            className={cn(
              'h-full rounded-full',
              isSecondary ? 'bg-neutral-light' : 'bg-secondary-light',
            )}
            style={{ width: `${asset.portion * 100}%` }}
          />
        </div>
      </div>
    ),
  };
};

export const VoteDialogAsset = ({ asset, onSelect }: VoteDialogAssetProps) => {
  const { icon, content } = getVoteAssetComponents(asset);

  return (
    <Dialog.RadioItem
      title=''
      key={asset.asset.base}
      value={asset.asset.base}
      onSelect={onSelect}
      startAdornment={icon}
      endAdornment={content}
    />
  );
};
