'use client';

import { useQuery } from '@tanstack/react-query';
import { SummaryDataResponse } from '@/shared/api/server/summary/types';
import { SummariesResponse } from '@/shared/api/server/summary/all';
import { DurationWindow } from '@/shared/utils/duration';

const BASE_LIMIT = 15;
const BASE_OFFSET = 0;
const BASE_WINDOW: DurationWindow = '1d';

export const useSummaries = () => {
  return useQuery({
    queryKey: ['summaries', BASE_LIMIT, BASE_OFFSET],
    queryFn: async () => {
      const paramsObj = {
        limit: BASE_LIMIT.toString(),
        offset: BASE_OFFSET.toString(),
        durationWindow: BASE_WINDOW,
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
