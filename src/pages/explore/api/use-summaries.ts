'use client';

import { InfiniteData, QueryKey, useInfiniteQuery } from '@tanstack/react-query';
import { SummaryData } from '@/shared/api/server/summary/types';
import { DurationWindow } from '@/shared/utils/duration';
import { apiFetch } from '@/shared/utils/api-fetch';

/// The base limit will need to be increased as more trading pairs are added to the explore page.
const BASE_LIMIT = 20;
const BASE_PAGE = 0;
const BASE_WINDOW: DurationWindow = '1d';

export const useSummaries = (search: string) => {
  return useInfiniteQuery<SummaryData[], Error, InfiniteData<SummaryData[]>, QueryKey, number>({
    queryKey: ['summaries', search],
    staleTime: 1000 * 60 * 5,
    initialPageParam: BASE_PAGE,
    getNextPageParam: (lastPage, _, lastPageParam) => {
      return lastPage.length ? lastPageParam + 1 : undefined;
    },
    queryFn: async ({ pageParam }) => {
      return apiFetch<SummaryData[]>('/api/summaries', {
        search,
        limit: BASE_LIMIT.toString(),
        offset: (pageParam * BASE_LIMIT).toString(),
        durationWindow: BASE_WINDOW,
      });
    },
  });
};
