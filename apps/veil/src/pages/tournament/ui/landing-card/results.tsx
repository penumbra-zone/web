import { round } from '@penumbra-zone/types/round';
import { Text } from '@penumbra-zone/ui/Text';
import { Skeleton } from '@penumbra-zone/ui/Skeleton';
import { AssetIcon } from '@penumbra-zone/ui/AssetIcon';
import type { MappedGauge } from '../../server/previous-epochs';

export interface TournamentResultsProps {
  results: MappedGauge[];
  loading: boolean;
}

export const TournamentResults = ({ loading, results }: TournamentResultsProps) => {
  if (!loading && !results.length) {
    return <div className='grow' />;
  }

  return (
    <div className='flex grow flex-col gap-4'>
      {loading ? (
        <div className='h-6 w-24 rounded'>
          <Skeleton />
        </div>
      ) : (
        <Text strong color='text.primary'>
          Current Results
        </Text>
      )}

      {loading
        ? new Array(5).fill({}).map((_, index) => (
            <div key={index} className='w-full h-8 rounded'>
              <Skeleton />
            </div>
          ))
        : results.map(asset => (
            <div key={asset.asset.symbol} className='flex gap-3'>
              <AssetIcon metadata={asset.asset} size='lg' />

              <div className='flex w-full flex-col gap-2'>
                <div className='flex justify-between w-full'>
                  <Text technical color='text.primary'>
                    {asset.asset.symbol}
                  </Text>
                  <Text technical color='text.secondary'>
                    {round({ value: asset.portion * 100, decimals: 0 })}%
                  </Text>
                </div>
                <div className='flex w-full h-[6px] bg-other-tonalFill5 rounded-full overflow-hidden'>
                  <div
                    className='h-full bg-secondary-light'
                    style={{ width: `calc(${asset.portion * 100}% - 1px)` }}
                  />
                </div>
              </div>
            </div>
          ))}
    </div>
  );
};
