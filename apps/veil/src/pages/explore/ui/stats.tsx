import { shortify } from '@penumbra-zone/types/shortify';
import { getFormattedAmtFromValueView } from '@penumbra-zone/types/value-view';
import { Value } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { isNumeraireSymbol, isStablecoinSymbol } from '@/shared/utils/is-symbol';
import type { Stats } from '../server/stats';
import { toValueView } from '@/shared/utils/value-view';
import { useRegistry } from '@/shared/api/registry';
import Link from 'next/link';
import { getTradePairPath } from '@/shared/const/pages';

export const ExploreStats = ({ stats }: { stats: Stats }) => {
  const { data: registry } = useRegistry();
  const volumeValue = toValueView({
    value: new Value({ amount: stats.totalTradingVolume, assetId: stats.indexingAsset }),
    getMetadata: x => registry.tryGetMetadata(x),
  });
  
  const largestPairVolumeValue = toValueView({
    value: new Value({
      amount: stats.largestTradingPairByVolume.volume,
      assetId: stats.indexingAsset,
    }),
    getMetadata: x => registry.tryGetMetadata(x),
  });
  
  const startSymbol = (stats.largestTradingPairByVolume.pair.start && registry.tryGetMetadata(stats.largestTradingPairByVolume.pair.start)?.symbol) ?? 'unknown';
  const endSymbol = (stats.largestTradingPairByVolume.pair.end && registry.tryGetMetadata(stats.largestTradingPairByVolume.pair.end)?.symbol) ?? 'unknown';
  const pairName = isStablecoinSymbol(startSymbol) && isNumeraireSymbol(startSymbol) 
    ? `${endSymbol}/${startSymbol}` 
    : `${startSymbol}/${endSymbol}`;

  return (
    <div className='flex flex-wrap items-center gap-x-6 gap-y-2 text-sm' style={{ fontFamily: 'Inter, -apple-system, system-ui, sans-serif' }}>
      <div className='flex items-center gap-2'>
        <span className='text-text-secondary'>24h Volume:</span>
        <span className='text-text-primary font-medium' style={{ fontVariantNumeric: 'tabular-nums' }}>
          {shortify(Number(getFormattedAmtFromValueView(volumeValue)))} {volumeValue.valueView.case === 'knownAssetId' ? volumeValue.valueView.value.metadata?.symbol : ''}
        </span>
      </div>
      
      <span className='text-text-secondary/30 hidden tablet:inline'>•</span>
      
      <div className='flex items-center gap-2'>
        <span className='text-text-secondary'>Trades:</span>
        <span className='text-text-primary font-medium' style={{ fontVariantNumeric: 'tabular-nums' }}>
          {stats.trades.toLocaleString()}
        </span>
      </div>
      
      <span className='text-text-secondary/30 hidden desktop:inline'>•</span>
      
      <div className='hidden desktop:flex items-center gap-2'>
        <span className='text-text-secondary'>Top Pair:</span>
        <Link 
          href={getTradePairPath(startSymbol, endSymbol)}
          className='text-text-primary font-medium hover:text-primary-light transition-colors cursor-pointer'
        >
          {pairName}
        </Link>
        <span className='text-text-secondary' style={{ fontVariantNumeric: 'tabular-nums' }}>
          ({shortify(Number(getFormattedAmtFromValueView(largestPairVolumeValue)))})
        </span>
      </div>
    </div>
  );
};
