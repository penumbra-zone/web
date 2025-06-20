'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Text } from '@penumbra-zone/ui/Text';
import { TextInput } from '@penumbra-zone/ui/TextInput';
import { Icon } from '@penumbra-zone/ui/Icon';
import { PairCard } from '@/pages/explore/ui/pair-card';
import type { SummaryWithPrices } from '@/shared/api/server/summary';
import { useDebounce } from '@/shared/utils/use-debounce';
import { useGetMetadata } from '@/shared/api/assets';
import { deserialize, Serialized } from '@/shared/utils/serializer';

interface ExplorePairsProps {
  summaries: Serialized<SummaryWithPrices[]>;
}

export const ExplorePairs = ({ summaries }: ExplorePairsProps) => {
  const getMetadata = useGetMetadata();
  const augmentedSummaries = useMemo(() => {
    const deserialized = deserialize<SummaryWithPrices[]>(summaries);
    const out: [SummaryWithPrices, string, string][] = deserialized.map(x => [
      x,
      getMetadata(x.start)?.symbol?.toUpperCase() ?? '',
      getMetadata(x.end)?.symbol?.toUpperCase() ?? '',
    ]);
    return out;
  }, [summaries]);
  const [rawSearch, setSearch] = useState('');
  const search = useDebounce(rawSearch, 200);
  const filteredSummaries = useMemo(() => {
    if (!search) {
      return augmentedSummaries.map(x => x[0]);
    }
    const target = search.toUpperCase();
    return augmentedSummaries
      .filter(x => x[1].includes(target) || x[2].includes(target))
      .map(x => x[0]);
  }, [augmentedSummaries, search]);

  return (
    <div className='w-full flex flex-col gap-4'>
      <div className='flex gap-4 justify-between items-center text-text-primary'>
        <Text large whitespace='nowrap'>
          Trading Pairs
        </Text>
        <TextInput
          value={rawSearch}
          placeholder='Search pair'
          startAdornment={<Icon size='md' IconComponent={Search} />}
          onChange={setSearch}
        />
      </div>

      <div className='grid grid-cols-[1fr_1fr_1fr_1fr_128px_56px] gap-2 overflow-y-auto overflow-x-auto desktop:overflow-x-hidden'>
        <div className='grid grid-cols-subgrid col-span-6 py-2 px-3'>
          <Text detail color='text.secondary' align='left'>
            Pair
          </Text>
          <Text detail color='text.secondary' align='right'>
            Price
          </Text>
          <Text detail color='text.secondary' align='right'>
            Liquidity
          </Text>
          <Text detail color='text.secondary' align='right' whitespace='nowrap'>
            24h Volume
          </Text>
          <Text detail color='text.secondary' align='right' whitespace='nowrap'>
            24h Price Change
          </Text>
          <Text detail color='text.secondary' align='right'>
            Actions
          </Text>
        </div>

        {filteredSummaries.length === 0 && (
          <div className='py-5 col-span-5 text-text-secondary'>
            <Text small>No pairs found matching your search</Text>
          </div>
        )}

        {filteredSummaries.map(summary => (
          <PairCard
            summary={summary}
            key={`${summary.start.toJsonString()}${summary.end.toJsonString()}`}
          />
        ))}
      </div>
    </div>
  );
};
