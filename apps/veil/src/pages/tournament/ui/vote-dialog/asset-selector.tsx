import { useMemo } from 'react';
import { Dialog } from '@penumbra-zone/ui/Dialog';
import { Text } from '@penumbra-zone/ui/Text';
import type { MappedGauge } from '../../../../shared/api/server/tournament/previous-epochs';
import { LoadingVoteAsset } from './loading-vote-asset';
import { VoteDialogAsset } from './vote-dialog-asset';

export interface VotingAssetSelectorProps {
  value: string | undefined;
  selectedAsset: MappedGauge | undefined;
  loading: boolean;
  gauge: MappedGauge[];
  onSelect: (asset: MappedGauge) => void;
}

export const VotingAssetSelector = ({
  value,
  selectedAsset,
  loading,
  gauge,
  onSelect,
}: VotingAssetSelectorProps) => {
  const gaugeWithValue = useMemo(() => {
    if (!selectedAsset) {
      return gauge;
    }

    return [selectedAsset, ...gauge.filter(asset => asset.asset.base !== selectedAsset.asset.base)];
  }, [selectedAsset, gauge]);

  return (
    <div className='flex flex-col gap-2'>
      <Text small color='text.secondary'>
        Select Asset
      </Text>

      <Dialog.RadioGroup value={value}>
        <div className='flex flex-col gap-1'>
          {loading && new Array(5).fill({}).map((_, index) => <LoadingVoteAsset key={index} />)}

          {!loading &&
            gaugeWithValue.map(asset => (
              <VoteDialogAsset
                key={asset.asset.base}
                asset={asset}
                onSelect={() => onSelect(asset)}
              />
            ))}
        </div>
      </Dialog.RadioGroup>
    </div>
  );
};
