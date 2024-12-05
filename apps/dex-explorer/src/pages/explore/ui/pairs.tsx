'use client';

import { useEffect, useRef, useState } from 'react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { Search } from 'lucide-react';
import { Text } from '@penumbra-zone/ui/Text';
import { TextInput } from '@penumbra-zone/ui/TextInput';
import { Icon } from '@penumbra-zone/ui/Icon';
import { PairCard } from '@/pages/explore/ui/pair-card';
import { useSummaries } from '@/pages/explore/api/use-summaries';
import SpinnerIcon from '@/shared/assets/spinner-icon.svg';

/** A hook that fires the callback when observed element (on the bottom of the page) is in the view */
const useObserver = (disabled: boolean, cb: VoidFunction) => {
  const observerEl = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ref = observerEl.current;
    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries;
        if (entry?.isIntersecting && !disabled) {
          cb();
        }
      },
      {
        root: null,
        rootMargin: '20px',
        threshold: 1.0,
      },
    );

    if (ref) {
      observer.observe(ref);
    }

    return () => {
      if (ref) {
        observer.unobserve(ref);
      }
    };
  }, [cb, disabled]);

  return {
    observerEl,
  };
};

export const ExplorePairs = () => {
  const [parent] = useAutoAnimate();

  const [search, setSearch] = useState('');

  const { data, isLoading, isRefetching, isFetchingNextPage, fetchNextPage } = useSummaries(search);

  const { observerEl } = useObserver(isLoading || isRefetching || isFetchingNextPage, () => {
    void fetchNextPage();
  });

  return (
    <div className='w-full flex flex-col gap-4'>
      <div className='flex gap-4 justify-between items-center text-text-primary'>
        <Text large whitespace='nowrap'>
          Trading Pairs
        </Text>
        <TextInput
          value={search}
          placeholder='Search pair'
          startAdornment={<Icon size='md' IconComponent={Search} />}
          onChange={setSearch}
        />
      </div>

      <div ref={parent} className='grid grid-cols-[1fr_1fr_1fr_1fr_128px_56px] gap-2 overflow-auto'>
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

        {isLoading && (
          <>
            <PairCard loading summary={undefined} />
            <PairCard loading summary={undefined} />
          </>
        )}

        {data?.pages.map(page =>
          page.map(summary => (
            <PairCard
              loading={false}
              summary={summary}
              key={`${summary.baseAsset.symbol}/${summary.quoteAsset.symbol}`}
            />
          )),
        )}
      </div>

      {isFetchingNextPage && (
        <div className='flex items-center justify-center h-6 my-1'>
          <SpinnerIcon className='animate-spin' />
        </div>
      )}

      <div className='h-1 w-full' ref={observerEl} />
    </div>
  );
};
