import { useMemo } from 'react';
import { InfoIcon } from 'lucide-react';
import { Text } from '@penumbra-zone/ui/Text';
import { Tooltip } from '@penumbra-zone/ui/Tooltip';
import { Skeleton } from '@penumbra-zone/ui/Skeleton';
import type { MappedGauge } from '../../server/previous-epochs';
import {
  VoteAssetIcon,
  VoteAssetContent,
  VOTING_THRESHOLD,
} from '../vote-dialog/vote-dialog-asset';
import { ProvideLiquidityButton } from '../shared/provide-liquidity-button';

export interface TournamentResultsProps {
  results: MappedGauge[];
  loading: boolean;
}

const TournamentResultsAsset = ({ asset }: { asset: MappedGauge }) => {
  return (
    <div key={asset.asset.symbol} className='flex items-center gap-3'>
      <VoteAssetIcon asset={asset} />
      <VoteAssetContent asset={asset} />
      <ProvideLiquidityButton
        symbol={asset.asset.symbol}
        primary={asset.portion >= VOTING_THRESHOLD}
      />
    </div>
  );
};

export const TournamentResults = ({ loading, results }: TournamentResultsProps) => {
  const { below, above } = useMemo(() => {
    if (!results.length || loading) {
      return {
        below: [],
        above: [],
      };
    }

    const belowIndex = results.findIndex(asset => asset.portion < VOTING_THRESHOLD);
    const above = results.slice(0, belowIndex === -1 ? results.length : belowIndex);
    let below = results.slice(belowIndex === -1 ? results.length : belowIndex);
    below = above.length > 5 ? [] : below.slice(0, 5 - above.length);

    return {
      below,
      above,
    };
  }, [results, loading]);

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

      {loading ? (
        new Array(5).fill({}).map((_, index) => (
          <div key={index} className='h-8 w-full rounded'>
            <Skeleton />
          </div>
        ))
      ) : (
        <>
          {above.slice(0, 5).map(asset => (
            <TournamentResultsAsset asset={asset} key={asset.asset.base} />
          ))}
        </>
      )}

      {!!below.length && (
        <div className='flex items-center gap-2'>
          <Text small color='text.secondary'>
            Below threshold ({'<'}5%)
          </Text>
          <Tooltip message='LPs for assets below the 5% threshold are not eligible for rewards'>
            <InfoIcon className='size-3 text-neutral-light' />
          </Tooltip>
        </div>
      )}

      {below.map(asset => (
        <TournamentResultsAsset asset={asset} key={asset.asset.base} />
      ))}
    </div>
  );
};
