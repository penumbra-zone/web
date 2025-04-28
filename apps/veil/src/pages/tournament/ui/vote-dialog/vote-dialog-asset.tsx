import cn from 'clsx';
import { AssetIcon } from '@penumbra-zone/ui/AssetIcon';
import { Dialog } from '@penumbra-zone/ui/Dialog';
import { Text } from '@penumbra-zone/ui/Text';
import type { MappedGauge } from '../../../../shared/api/server/tournament/previous-epochs';

const VOTING_THRESHOLD = 0.05;

export interface VoteDialogAssetProps {
  asset: MappedGauge;
  onSelect: VoidFunction;
}

export const VoteDialogAsset = ({ asset, onSelect }: VoteDialogAssetProps) => {
  const isSecondary = asset.portion < VOTING_THRESHOLD;

  return (
    <Dialog.RadioItem
      title=''
      key={asset.asset.base}
      value={asset.asset.base}
      onSelect={onSelect}
      startAdornment={<AssetIcon size='lg' metadata={asset.asset} />}
      endAdornment={
        <div className='grow flex flex-col gap-1 ml-1'>
          <div className='flex w-full justify-between gap-1'>
            <Text technical color='text.primary'>
              {asset.asset.symbol}
            </Text>
            <Text technical color={isSecondary ? 'neutral.light' : 'text.primary'}>
              {asset.portion * 100}%
            </Text>
          </div>

          <div className='flex w-full h-[6px] bg-other-tonalFill5 rounded-full'>
            <div
              className={cn(
                'h-full rounded-full',
                isSecondary ? 'bg-[#888888]' : 'bg-secondary-light',
              )}
              style={{ width: `${asset.portion * 100}%` }}
            />
          </div>
        </div>
      }
    />
  );
};
