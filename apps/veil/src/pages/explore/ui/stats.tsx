import { Text } from '@penumbra-zone/ui/Text';
import { InfoCard } from '../../../shared/ui/info-card';
import { pluralizeAndShortify } from '@/shared/utils/pluralize';
import { shortify } from '@penumbra-zone/types/shortify';
import { getFormattedAmtFromValueView } from '@penumbra-zone/types/value-view';
import { Value, ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { DirectedTradingPair } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { Registry } from '@penumbra-labs/registry';
import { isNumeraireSymbol, isStablecoinSymbol } from '@/shared/utils/is-symbol';
import type { Stats } from '../server/stats';
import { toValueView } from '@/shared/utils/value-view';

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

interface CardProps {
  registry: Registry;
  stats: Stats;
}

const TotalTradingVolume = ({ registry, stats }: CardProps) => {
  const amount = stats.totalTradingVolume;
  const value = toValueView({
    value: new Value({ amount, assetId: stats.indexingAsset }),
    getMetadata: x => registry.tryGetMetadata(x),
  });
  return (
    <InfoCard title='Total Trading Volume (24h)'>
      <GreenValueText value={value} />
    </InfoCard>
  );
};

const NumberOfTrades = ({ stats }: CardProps) => {
  return (
    <InfoCard title='Number of Trades (24h)'>
      <Text large color='text.primary'>
        {pluralizeAndShortify(stats.trades, 'trade', 'trades')}
      </Text>
    </InfoCard>
  );
};

const LargestTradingPair = ({ registry, stats }: CardProps) => {
  const value = toValueView({
    value: new Value({
      amount: stats.largestTradingPairByVolume.volume,
      assetId: stats.indexingAsset,
    }),
    getMetadata: x => registry.tryGetMetadata(x),
  });
  return (
    <InfoCard title='Largest Trading Pair (24h volume)'>
      <DirectedTradingPairText registry={registry} pair={stats.largestTradingPairByVolume.pair} />
      <GreenValueText value={value} />
    </InfoCard>
  );
};

const TotalLiquidity = ({ registry, stats }: CardProps) => {
  const amount = stats.totalLiquidity;
  const value = toValueView({
    value: new Value({ amount, assetId: stats.indexingAsset }),
    getMetadata: x => registry.tryGetMetadata(x),
  });
  return (
    <InfoCard title='Total Liquidity Available'>
      <GreenValueText value={value} />
    </InfoCard>
  );
};

const NumberOfActivePairs = ({ stats }: CardProps) => {
  return (
    <InfoCard title='Number of Trades (24h)'>
      <Text large color='text.primary'>
        {pluralizeAndShortify(stats.activePairs, 'pair', 'pairs')}
      </Text>
    </InfoCard>
  );
};

export const ExploreStats = ({ registry, stats }: { registry: Registry; stats: Stats }) => {
  return (
    <div className='grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-2'>
      <TotalTradingVolume registry={registry} stats={stats} />
      <NumberOfTrades registry={registry} stats={stats} />
      <LargestTradingPair registry={registry} stats={stats} />
      <TotalLiquidity registry={registry} stats={stats} />
      <NumberOfActivePairs registry={registry} stats={stats} />
      <InfoCard title='Top Price Mover (24h)'>
        <Text large color='text.primary'>
          -
        </Text>
      </InfoCard>
    </div>
  );
};
