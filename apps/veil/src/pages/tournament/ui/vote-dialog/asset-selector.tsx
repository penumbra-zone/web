import { useMemo } from 'react';
import { Dialog } from '@penumbra-zone/ui/Dialog';
import { Text } from '@penumbra-zone/ui/Text';
import type { MappedGauge } from '../../server/previous-epochs';
import { LoadingVoteAsset } from './loading-vote-asset';
import { VoteDialogAsset } from './vote-dialog-asset';
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
  const uniqueGauge = useMemo(() => {
    const seen = new Set<string>();
    return gauge.filter(g => {
      if (seen.has(g.asset.base)) {
        return false;
      }
      seen.add(g.asset.base);
      return true;
    });
  }, [gauge]);

  const gaugeWithValue = useMemo(() => {
    if (!selectedAsset) {
      return uniqueGauge;
    }
    return [selectedAsset, ...uniqueGauge.filter(a => a.asset.base !== selectedAsset.asset.base)];
  }, [selectedAsset, uniqueGauge]);

  return (
    <div className='flex flex-col gap-2'>
      <Text small color='text.secondary'>
        Select Asset
      </Text>

      {!loading && !gaugeWithValue.length && <VotingDialogNoResults />}

      <Dialog.RadioGroup value={selectedAsset?.asset.base}>
        <div className='flex flex-col gap-1'>
          {loading && new Array(5).fill({}).map((_, index) => <LoadingVoteAsset key={index} />)}

          {!loading &&
            gaugeWithValue.map((asset, idx) => (
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
};
