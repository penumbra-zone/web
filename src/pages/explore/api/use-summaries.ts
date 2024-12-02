'use client';

import { useQuery } from '@tanstack/react-query';
import { DurationWindow } from '@/shared/utils/duration.ts';
import { SummaryDataResponse } from '@/shared/api/server/summary/types';
import { SummariesResponse } from '@/shared/api/server/summary/all';

const BASE_LIMIT = 15;
const BASE_WINDOW: DurationWindow = '1d';
const BASE_OFFSET = 0;

export const useSummaries = () => {
  return useQuery({
    queryKey: ['summaries', BASE_LIMIT, BASE_OFFSET, BASE_WINDOW],
    queryFn: async () => {
      const paramsObj = {
        durationWindow: BASE_WINDOW,
        limit: BASE_LIMIT.toString(),
        offset: BASE_OFFSET.toString(),
      };

      const baseUrl = '/api/summaries';
      const urlParams = new URLSearchParams(paramsObj).toString();
      const fetchRes = await fetch(`${baseUrl}?${urlParams}`);
      const jsonRes = (await fetchRes.json()) as SummariesResponse;
      if ('error' in jsonRes) {
        throw new Error(jsonRes.error);
      }

      return jsonRes.map(res => SummaryDataResponse.fromJson(res));
    },
  });
};
