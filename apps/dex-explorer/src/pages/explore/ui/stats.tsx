'use client';

import { round } from '@penumbra-zone/types/round';
import { Text } from '@penumbra-zone/ui/Text';
import { InfoCard } from './info-card';
import { pluralizeAndShortify } from '@/shared/utils/pluralize';
import { shortify } from '@penumbra-zone/types/shortify';
import { getFormattedAmtFromValueView } from '@penumbra-zone/types/value-view';
import { useStats } from '@/pages/explore/api/use-stats';
import { useRegistryAssets } from '@/shared/api/registry';

export const ExploreStats = () => {
  const { data: stats, isLoading, error } = useStats();
  const { data: assets } = useRegistryAssets();
  const usdcMetadata = assets?.find(asset => asset.symbol === 'USDC');

  if (error) {
    return (
      <Text large color='destructive.light'>
        {error.message}
      </Text>
    );
  }

  return (
    <div className='grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-2'>
      <InfoCard title='Total Trading Volume (24h)' loading={isLoading}>
        {stats && (
          <Text large color='success.light'>
            {shortify(Number(getFormattedAmtFromValueView(stats.directVolume)))}{' '}
            {usdcMetadata?.symbol}
          </Text>
        )}
      </InfoCard>
      <InfoCard title='Number of Trades (24h)' loading={isLoading}>
        {stats && (
          <Text large color='text.primary'>
            {pluralizeAndShortify(stats.trades, 'trade', 'trades')}
          </Text>
        )}
      </InfoCard>
      <InfoCard title='Largest Trading Pair (24h volume)' loading={isLoading}>
        {stats?.largestPair ? (
          <>
            <Text large color='text.primary'>
              {stats.largestPair.start}/{stats.largestPair.end}
            </Text>
            {stats.largestPairLiquidity && (
              <Text large color='success.light'>
                {shortify(Number(getFormattedAmtFromValueView(stats.largestPairLiquidity)))}{' '}
                {usdcMetadata?.symbol}
              </Text>
            )}
          </>
        ) : (
          <Text large color='text.primary'>
            -
          </Text>
        )}
      </InfoCard>
      <InfoCard title='Total Liquidity Available' loading={isLoading}>
        {stats && (
          <Text large color='success.light'>
            {shortify(Number(getFormattedAmtFromValueView(stats.liquidity)))} {usdcMetadata?.symbol}
          </Text>
        )}
      </InfoCard>
      <InfoCard title='Number of Active Pairs' loading={isLoading}>
        {stats && (
          <Text large color='text.primary'>
            {pluralizeAndShortify(stats.activePairs, 'pair', 'pairs')}
          </Text>
        )}
      </InfoCard>
      <InfoCard title='Top Price Mover (24h)' loading={isLoading}>
        {stats?.topPriceMover ? (
          <>
            <Text large color='text.primary'>
              {stats.topPriceMover.start}/{stats.topPriceMover.end}
            </Text>
            <Text large color={stats.topPriceMover.percent ? 'success.light' : 'destructive.light'}>
              {stats.topPriceMover.percent && '+'}
              {round({ value: stats.topPriceMover.percent, decimals: 1 })}%
            </Text>
          </>
        ) : (
          <Text large color='text.primary'>
            -
          </Text>
        )}
      </InfoCard>
    </div>
  );
};
