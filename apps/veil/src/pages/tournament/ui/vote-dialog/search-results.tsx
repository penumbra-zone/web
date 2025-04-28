import { useMemo } from 'react';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { assetPatterns } from '@penumbra-zone/types/assets';
import { Dialog } from '@penumbra-zone/ui/Dialog';
import { Text } from '@penumbra-zone/ui/Text';
import { useRegistryAssets } from '@/shared/api/registry';
import type { MappedGauge } from '../../../../shared/api/server/tournament/previous-epochs';
import { LoadingVoteAsset } from './loading-vote-asset';
import { VoteDialogAsset } from './vote-dialog-asset';
import { VotingDialogNoResults } from './no-results';

export interface VoteDialogSearchResultsProps {
  value: string | undefined;
  gauge: MappedGauge[];
  search: string;
  onSelect: (asset: MappedGauge) => void;
}

export const VoteDialogSearchResults = ({
  value,
  gauge,
  search,
  onSelect,
}: VoteDialogSearchResultsProps) => {
  const { data: assets, isLoading } = useRegistryAssets();

  const gaugeMapByDenom = useMemo(
    () =>
      gauge.reduce<Map<string, MappedGauge>>((accum, current) => {
        accum.set(current.asset.base, current);
        return accum;
      }, new Map()),
    [gauge],
  );

  const filteredAssets = useMemo<Metadata[]>(() => {
    return (
      assets?.filter(asset => {
        return (
          assetPatterns.ibc.matches(asset.base) &&
          (asset.symbol.toLowerCase().includes(search.toLowerCase()) ||
            asset.description.toLowerCase().includes(search.toLowerCase()))
        );
      }) ?? []
    );
  }, [assets, search]);

  const mappedAssets = useMemo<MappedGauge[]>(() => {
    return filteredAssets.map(asset => {
      const fromGauge = gaugeMapByDenom.get(asset.base);
      if (fromGauge) {
        return fromGauge;
      }

      return {
        asset,
        epoch: 0,
        votes: 0,
        portion: 0,
        missing_votes: 0n,
      };
    });
  }, [filteredAssets, gaugeMapByDenom]);

  return (
    <div className='flex flex-col gap-2'>
      <Text small color='text.secondary'>
        Search results
      </Text>

      {!isLoading && !mappedAssets.length && <VotingDialogNoResults />}

      <Dialog.RadioGroup value={value}>
        <div className='flex flex-col gap-1'>
          {isLoading && new Array(5).fill({}).map((_, index) => <LoadingVoteAsset key={index} />)}

          {!isLoading &&
            mappedAssets.map(asset => (
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
