import { useMemo } from 'react';
import { Skeleton } from '@penumbra-zone/ui/Skeleton';
import { Dialog } from '@penumbra-zone/ui/Dialog';
import { Text } from '@penumbra-zone/ui/Text';
import type { MappedGauge } from '../../server/previous-epochs';
import { LoadingVoteAsset } from './loading-vote-asset';
import { VoteDialogAsset, VOTING_THRESHOLD } from './vote-dialog-asset';
import { VotingDialogNoResults } from './no-results';

export interface VotingAssetSelectorProps {
  selectedAsset: MappedGauge | undefined;
  loading: boolean;
  gauge: MappedGauge[];
  onSelect: (asset: MappedGauge) => void;
}

export const VotingAssetSelector = ({
  selectedAsset,
  loading,
  gauge,
  onSelect,
}: VotingAssetSelectorProps) => {
  // split gauges into two groups based on the voting threshold, remove duplicates
  const gaugeWithValue = useMemo(() => {
    const seen = new Set<string>();
    const withValue = selectedAsset ? [selectedAsset, ...gauge] : gauge;

    return withValue.reduce<{ above: MappedGauge[]; below: MappedGauge[] }>(
      (accum, current) => {
        if (seen.has(current.asset.base)) {
          return accum;
        }

        seen.add(current.asset.base);
        if (current.portion >= VOTING_THRESHOLD) {
          accum.above.push(current);
        } else {
          accum.below.push(current);
        }

        return accum;
      },
      { above: [], below: [] },
    );
  }, [selectedAsset, gauge]);

  if (loading) {
    return (
      <div className='flex flex-col gap-2'>
        <div className='h-4 w-20'>
          <Skeleton />
        </div>
        <div className='flex flex-col gap-1'>
          {new Array(5).fill({}).map((_, index) => (
            <LoadingVoteAsset key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (!gaugeWithValue.above.length) {
    return (
      <div className='flex flex-col gap-2'>
        <Text small color='text.secondary'>
          Select Asset
        </Text>

        {!gaugeWithValue.below.length && <VotingDialogNoResults />}

        <Dialog.RadioGroup value={selectedAsset?.asset.base}>
          <div className='flex flex-col gap-1'>
            {gaugeWithValue.below.slice(0, 10).map((asset, idx) => (
              <VoteDialogAsset
                key={`${asset.asset.base}-${idx}`}
                asset={asset}
                onSelect={() => onSelect(asset)}
              />
            ))}
          </div>
        </Dialog.RadioGroup>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-col gap-2'>
        <Text small color='text.secondary'>
          Above threshold (≥5%)
        </Text>

        <Dialog.RadioGroup value={selectedAsset?.asset.base}>
          <div className='flex flex-col gap-1'>
            {gaugeWithValue.above.map((asset, idx) => (
              <VoteDialogAsset
                key={`${asset.asset.base}-${idx}`}
                asset={asset}
                onSelect={() => onSelect(asset)}
              />
            ))}
          </div>
        </Dialog.RadioGroup>
      </div>

      <div className='flex flex-col gap-2'>
        <Text small color='text.secondary'>
          Below threshold ({'<'}5%)
        </Text>

        <Dialog.RadioGroup value={selectedAsset?.asset.base}>
          <div className='flex flex-col gap-1'>
            {gaugeWithValue.below.slice(0, 10).map((asset, idx) => (
              <VoteDialogAsset
                key={`${asset.asset.base}-${idx}`}
                asset={asset}
                onSelect={() => onSelect(asset)}
              />
            ))}
          </div>
        </Dialog.RadioGroup>
      </div>
    </div>
  );
};
