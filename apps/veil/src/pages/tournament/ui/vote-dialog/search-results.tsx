import { Dialog } from '@penumbra-zone/ui/Dialog';
import { Text } from '@penumbra-zone/ui/Text';
import type { MappedGauge } from '../../server/previous-epochs';
import { VoteDialogAsset } from './vote-dialog-asset';
import { VotingDialogNoResults } from './no-results';

export interface VoteDialogSearchResultsProps {
  value: string | undefined;
  gauge: MappedGauge[];
  onSelect: (asset: MappedGauge) => void;
}

export const VoteDialogSearchResults = ({
  value,
  gauge,
  onSelect,
}: VoteDialogSearchResultsProps) => {
  return (
    <div className='flex flex-col gap-2'>
      <Text small color='text.secondary'>
        Search results
      </Text>

      {!gauge.length && <VotingDialogNoResults />}

      <Dialog.RadioGroup value={value}>
        <div className='flex flex-col gap-1'>
          {gauge.map(asset => (
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
