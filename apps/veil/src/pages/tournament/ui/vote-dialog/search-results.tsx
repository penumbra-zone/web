import { useMemo } from 'react';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { AssetIcon } from '@penumbra-zone/ui/AssetIcon';
import { Skeleton } from '@penumbra-zone/ui/Skeleton';
import { Dialog } from '@penumbra-zone/ui/Dialog';
import { Text } from '@penumbra-zone/ui/Text';
import { useAssets } from '@/shared/api/assets';
import type { MappedGauge } from '../../server/previous-epochs';

const LoadingVoteAsset = () => {
  return (
    <div className='w-full h-14 flex gap-3 p-3'>
      <div className='size-8'>
        <Skeleton circular />
      </div>
      <div className='grow flex flex-col gap-1'>
        <div className='flex justify-between py-1'>
          <div className='h-4 w-10'>
            <Skeleton />
          </div>
          <div className='h-4 w-10'>
            <Skeleton />
          </div>
        </div>
        <div className='w-full h-1 rounded-xs overflow-hidden'>
          <Skeleton />
        </div>
      </div>
    </div>
  );
};

export interface VoteDialogSearchResultsProps {
  gauge: MappedGauge[];
  search: string;
}

export const VoteDialogSearchResults = ({ gauge, search }: VoteDialogSearchResultsProps) => {
  const { data: assets, isLoading } = useAssets(true);

  const gaugeMapByDenom = useMemo(() => gauge.reduce<Map<string, MappedGauge>>((accum, current) => {
    accum.set(current.asset.base, current);
    return accum;
  }, new Map()), [gauge]);

  const filteredAssets = useMemo<Metadata[]>(() => {
    return assets?.filter(asset => {
      return (
        asset.symbol.toLowerCase().includes(search.toLowerCase()) ||
        asset.description.toLowerCase().includes(search.toLowerCase())
      );
    }) ?? [];
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

      <Dialog.RadioGroup>
        <div className='flex flex-col gap-1'>
          {isLoading && new Array(5).fill({}).map((_, index) => <LoadingVoteAsset key={index} />)}

          {!isLoading && mappedAssets.map(asset => (
            <Dialog.RadioItem
              key={asset.asset.base}
              title={asset.asset.symbol}
              value={asset.asset.base}
              startAdornment={<AssetIcon metadata={asset.asset} />}
            />
          ))}
        </div>
      </Dialog.RadioGroup>
    </div>
  );
};
