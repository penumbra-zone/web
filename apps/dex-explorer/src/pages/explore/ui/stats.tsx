'use client';

// import { round } from '@penumbra-zone/types/round';
import { Text } from '@penumbra-zone/ui/Text';
import { InfoCard } from './info-card';
import { pluralizeAndShortify } from '@/shared/utils/pluralize';
import { shortify } from '@penumbra-zone/types/shortify';
import { getFormattedAmtFromValueView } from '@penumbra-zone/types/value-view';
import { useStats } from '@/pages/explore/api/use-stats';
import { useRegistry } from '@/shared/api/registry';
import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { DirectedTradingPair } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { Registry } from '@penumbra-labs/registry';
import { isNumeraireSymbol, isStablecoinSymbol } from '@/shared/utils/is-symbol';

const GreenValueText = ({ value }: { value: ValueView }) => {
  const symbol =
    value.valueView.case === 'knownAssetId' ? value.valueView.value.metadata?.symbol : undefined;
  return (
    <Text large color='success.light'>
      {shortify(Number(getFormattedAmtFromValueView(value)))} {symbol ?? 'unknown'}
    </Text>
  );
};

const DirectedTradingPairText = ({
  registry,
  pair,
}: {
  registry: Registry;
  pair: DirectedTradingPair;
}) => {
  const startSymbol = (pair.start && registry.tryGetMetadata(pair.start)?.symbol) ?? 'unknown';
  const endSymbol = (pair.end && registry.tryGetMetadata(pair.end)?.symbol) ?? 'unknown';

  // swap direction if start is a stablecoin or an important numeraire
  if (isStablecoinSymbol(startSymbol) && isNumeraireSymbol(startSymbol)) {
    return (
      <Text large color='text.primary'>
        {endSymbol}/{startSymbol}
      </Text>
    );
  }

  return (
    <Text large color='text.primary'>
      {startSymbol}/{endSymbol}
    </Text>
  );
};

export const ExploreStats = () => {
  const { data: stats, isLoading, error } = useStats();
  const { data: registry } = useRegistry();

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
        {stats && <GreenValueText value={stats.volume} />}
      </InfoCard>
      <InfoCard title='Number of Trades (24h)' loading={isLoading}>
        {stats && (
          <Text large color='text.primary'>
            {pluralizeAndShortify(stats.trades, 'trade', 'trades')}
          </Text>
        )}
      </InfoCard>
      <InfoCard title='Largest Trading Pair (24h volume)' loading={isLoading}>
        {registry && stats?.largestPair ? (
          <>
            <DirectedTradingPairText registry={registry} pair={stats.largestPair.pair} />
            <GreenValueText value={stats.largestPair.volume} />
          </>
        ) : (
          <Text large color='text.primary'>
            -
          </Text>
        )}
      </InfoCard>
      <InfoCard title='Total Liquidity Available' loading={isLoading}>
        {stats && <GreenValueText value={stats.liquidity} />}
      </InfoCard>
      <InfoCard title='Number of Active Pairs' loading={isLoading}>
        {stats && (
          <Text large color='text.primary'>
            {pluralizeAndShortify(stats.activePairs, 'pair', 'pairs')}
          </Text>
        )}
      </InfoCard>
      <InfoCard title='Top Price Mover (24h)' loading={isLoading}>
        <Text large color='text.primary'>
          -
        </Text>
      </InfoCard>
    </div>
  );
};
