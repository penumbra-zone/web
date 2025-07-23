'use client';

import { useMemo, useState, useEffect } from 'react';
import { Text } from '@penumbra-zone/ui/Text';
import { PairCard } from '@/pages/explore/ui/pair-card';
import type { SummaryWithPrices } from '@/shared/api/server/summary';
import { useGetMetadata } from '@/shared/api/assets';
import { deserialize, Serialized } from '@/shared/utils/serializer';
import { getFormattedAmtFromValueView } from '@penumbra-zone/types/value-view';
import { toValueView } from '@/shared/utils/value-view';
import { ExploreStats } from './stats';
import type { Stats } from '../server/stats';
import { ListPairCTA } from './list-pair-cta';

interface ExplorePairsProps {
  summaries: Serialized<SummaryWithPrices[]>;
  stats: Serialized<Stats>;
}

export const ExplorePairs = ({ summaries, stats }: ExplorePairsProps) => {
  const getMetadata = useGetMetadata();
  const [flashingPairs, setFlashingPairs] = useState<Set<string>>(new Set());
  const deserializedStats = useMemo(() => deserialize<Stats>(stats), [stats]);
  
  const augmentedSummaries = useMemo(() => {
    const deserialized = deserialize<SummaryWithPrices[]>(summaries);
    const out: [SummaryWithPrices, string, string][] = deserialized.map(x => [
      x,
      getMetadata(x.start)?.symbol.toUpperCase() ?? '',
      getMetadata(x.end)?.symbol.toUpperCase() ?? '',
    ]);
    return out;
  }, [summaries, getMetadata]);
  const filteredSummaries = useMemo(() => {
    return augmentedSummaries
      .filter(([summary, startSymbol, endSymbol]) => {
        // Convert volume to numeric value
        const volumeValue = Number(
          getFormattedAmtFromValueView(toValueView({ value: summary.volume, getMetadata }))
        );
        // Filter out pairs with less than $1000 volume
        if (volumeValue < 1000) return false;
        
        // Filter out UM pairs except UM/USDC
        const hasUM = startSymbol === 'UM' || endSymbol === 'UM';
        const hasUSDC = startSymbol === 'USDC' || endSymbol === 'USDC';
        
        // If it has UM but not USDC, hide it
        if (hasUM && !hasUSDC) return false;
        
        return true;
      })
      .map(x => x[0]);
  }, [augmentedSummaries, getMetadata]);

  // Flash random pairs every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (filteredSummaries.length === 0) return;
      
      // Randomly select 1-3 pairs to flash
      const numPairsToFlash = Math.floor(Math.random() * 3) + 1;
      const newFlashingPairs = new Set<string>();
      
      for (let i = 0; i < numPairsToFlash; i++) {
        const randomIndex = Math.floor(Math.random() * filteredSummaries.length);
        const randomPair = filteredSummaries[randomIndex];
        if (randomPair) {
          const pairKey = `${randomPair.start.toJsonString()}${randomPair.end.toJsonString()}`;
          newFlashingPairs.add(pairKey);
        }
      }
      
      setFlashingPairs(newFlashingPairs);
      
      // Remove flash after 300ms
      setTimeout(() => {
        setFlashingPairs(new Set());
      }, 300);
    }, 2000);

    return () => clearInterval(interval);
  }, [filteredSummaries]);

  return (
    <div className='flex w-full flex-col gap-4'>
      <ExploreStats stats={deserializedStats} />
      <div className='grid grid-cols-[1.5fr_1fr_1fr_1.5fr_1fr] gap-4 overflow-x-auto overflow-y-auto desktop:overflow-x-hidden'>
        <div className='col-span-5 grid grid-cols-subgrid px-3 py-2'>
          <Text detail color='text.secondary' align='left'>
            Pair
          </Text>
          <Text detail color='text.secondary' align='right'>
            Price
          </Text>
          <Text detail color='text.secondary' align='right' whitespace='nowrap'>
            24h Volume
          </Text>
          <Text detail color='text.secondary' align='center'>
            Depth (Base)
          </Text>
          <Text detail color='text.secondary' align='right' whitespace='nowrap'>
            24h Price Change
          </Text>
        </div>

        {filteredSummaries.length === 0 && (
          <div className='col-span-5 py-5 text-text-secondary'>
            <Text small>No pairs found</Text>
          </div>
        )}

        {filteredSummaries.map(summary => {
          const pairKey = `${summary.start.toJsonString()}${summary.end.toJsonString()}`;
          return (
            <PairCard
              summary={summary}
              key={pairKey}
              isFlashing={flashingPairs.has(pairKey)}
            />
          );
        })}
      </div>
      
      <ListPairCTA />
    </div>
  );
};
